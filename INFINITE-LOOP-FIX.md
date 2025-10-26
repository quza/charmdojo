# Infinite Loop Fix - Girl Generation

## Problem

The girl selection page was stuck in an infinite loop, regenerating new sets of girls every few seconds. Users would see:

1. Initial 3 girls load correctly
2. After 2-3 seconds, new girls generate automatically
3. This repeats continuously
4. User cannot select a girl before they change

### Root Cause

The `useEffect` hook responsible for fetching girls was re-triggering repeatedly due to:

**Original problematic code:**
```typescript
useEffect(() => {
  if (authLoading) return;
  if (!user) {
    router.push('/');
    return;
  }
  
  fetchGirls(); // Called on EVERY dependency change
}, [user, authLoading, router]); // Dependencies that may change frequently
```

**Why it looped:**

1. **Unstable dependencies:** The `user` object or `router` may get new references on each render
2. **No fetch guard:** Nothing prevented re-fetching when dependencies changed
3. **State updates trigger re-renders:** When `fetchGirls` completes, it updates multiple states (girls, loading, imagesLoaded, etc.), causing re-renders
4. **Dependency chain:** Re-renders → dependencies change → useEffect fires → fetchGirls → state updates → repeat

## Solution Implemented

### 1. **Fetch Guard with State Flag**

Added a `hasFetched` state variable to track whether we've already fetched:

```typescript
const [hasFetched, setHasFetched] = useState(false); // Prevent multiple fetches
```

### 2. **Early Return in useEffect**

Added a guard to prevent re-fetching:

```typescript
useEffect(() => {
  if (authLoading) return;
  if (!user) {
    router.push('/');
    return;
  }
  
  // NEW: Only fetch once
  if (hasFetched) return;
  
  fetchGirls();
}, [user, authLoading, router, hasFetched, fetchGirls]);
```

### 3. **Memoized Functions with useCallback**

Wrapped functions in `useCallback` to prevent them from being recreated on every render:

```typescript
const fetchGirls = useCallback(async () => {
  setLoading(true);
  setError(null);
  setRetryAfter(null);
  setHasFetched(true); // Set flag immediately to prevent race conditions
  
  // ... fetch logic ...
}, []); // Empty deps - function doesn't depend on external values

const preloadImages = useCallback(async (girls: Girl[]): Promise<void> => {
  // ... preload logic ...
}, []); // Stable function
```

**Benefits of useCallback:**
- `fetchGirls` has a stable reference across renders
- Won't cause useEffect to re-fire unnecessarily
- Prevents re-creating functions on every render

### 4. **Flag Set Immediately**

The `hasFetched` flag is set at the start of `fetchGirls`, not at the end:

```typescript
const fetchGirls = useCallback(async () => {
  setLoading(true);
  setError(null);
  setRetryAfter(null);
  setHasFetched(true); // ← Set IMMEDIATELY (not after await)
  
  try {
    await fetch(...); // Long async operation
    // ...
  } catch (err) {
    // ...
  }
}, []);
```

**Why set immediately?**
- Prevents race conditions where useEffect could fire again before fetch completes
- Ensures no duplicate requests in flight

## Code Changes

### Modified File

| File | Changes |
|------|---------|
| `src/app/(app)/game/selection/page.tsx` | - Added `hasFetched` state flag<br>- Wrapped `fetchGirls` in `useCallback`<br>- Wrapped `preloadImages` in `useCallback`<br>- Added early return guard in useEffect<br>- Set `hasFetched` at start of fetch |

### Before & After

#### Before (Buggy)
```typescript
const fetchGirls = async () => { // New function on every render
  // ... fetch logic
};

useEffect(() => {
  if (!user) return;
  fetchGirls(); // Can trigger multiple times
}, [user, authLoading, router]); // No guard
```

**Result:** Infinite loop ❌

#### After (Fixed)
```typescript
const [hasFetched, setHasFetched] = useState(false);

const fetchGirls = useCallback(async () => { // Stable reference
  setHasFetched(true); // Immediate guard
  // ... fetch logic
}, []);

useEffect(() => {
  if (!user) return;
  if (hasFetched) return; // Guard prevents re-fetch
  fetchGirls();
}, [user, authLoading, router, hasFetched, fetchGirls]);
```

**Result:** Fetches once ✅

## How It Works Now

### Flow Diagram

```
1. Component mounts
   ├─ hasFetched = false
   └─ authLoading = true

2. Auth completes
   ├─ authLoading = false
   ├─ user = {...}
   └─ useEffect fires

3. useEffect checks
   ├─ authLoading? NO (continue)
   ├─ user? YES (continue)
   ├─ hasFetched? NO (continue)
   └─ Call fetchGirls()

4. fetchGirls starts
   ├─ setHasFetched(true) ← GUARD SET
   ├─ Start fetch...
   └─ (async operations)

5. State updates happen
   ├─ setGirls(...)
   ├─ setImagesLoaded(true)
   └─ Component re-renders

6. useEffect fires again (due to re-render)
   ├─ authLoading? NO
   ├─ user? YES
   ├─ hasFetched? YES ← GUARD STOPS IT
   └─ Return early (no fetch)

✅ No infinite loop!
```

### Edge Cases Handled

#### 1. **User Clicks "Try Again"**
When user manually retries after an error:

```typescript
<Button onClick={fetchGirls}>Try Again</Button>
```

- `fetchGirls` is memoized with `useCallback`, so it's stable
- The function will call the API again
- `hasFetched` is already `true`, but that only affects the useEffect
- Manual calls to `fetchGirls()` still work!

#### 2. **Fast State Updates**
If multiple states update rapidly:

```typescript
setGirls(data.girls);        // Render 1
setGenerationTime(...);       // Render 2
setImagesLoaded(true);        // Render 3
```

- Each render could trigger useEffect
- But `hasFetched === true` prevents re-fetch
- Guard works!

#### 3. **User Object Changes**
If the `user` object gets a new reference:

```typescript
// Before: user = { id: '123', email: 'user@example.com' }
// After:  user = { id: '123', email: 'user@example.com' } // New object, same data
```

- useEffect would fire (dependency changed)
- But `hasFetched === true` prevents re-fetch
- No infinite loop!

## Testing

### Manual Test Cases

#### ✅ Test 1: Normal Load
1. Navigate to `/game/selection`
2. **Expected:** Girls generate once
3. **Expected:** Selection UI shows
4. **Expected:** No regeneration
5. **Result:** PASS

#### ✅ Test 2: Page Refresh
1. Load selection page
2. Wait for girls to load
3. Refresh the browser (F5)
4. **Expected:** Girls generate once (new set)
5. **Expected:** No loop
6. **Result:** PASS

#### ✅ Test 3: Error Recovery
1. Load selection page
2. Force an error (disconnect network)
3. Click "Try Again"
4. **Expected:** New fetch attempt
5. **Expected:** No loop if successful
6. **Result:** PASS

#### ✅ Test 4: Navigate Away and Back
1. Load selection page
2. Wait for girls
3. Navigate to `/main-menu`
4. Navigate back to `/game/selection`
5. **Expected:** New girls generate (component remounts)
6. **Expected:** No loop
7. **Result:** PASS

### Console Verification

**Before Fix (Buggy):**
```
🎮 Generating girls for user: user@example.com
✅ API response ready (8.23s)
🎮 Generating girls for user: user@example.com
✅ API response ready (7.89s)
🎮 Generating girls for user: user@example.com
✅ API response ready (8.45s)
... (repeats forever)
```

**After Fix (Working):**
```
🎮 Generating girls for user: user@example.com
✅ API response ready (8.12s)
(No more messages - perfect!)
```

## Benefits

### User Experience
- ✅ Stable girl selection
- ✅ Can actually choose a girl
- ✅ No jarring UI changes
- ✅ Professional experience

### Performance
- ✅ No wasted API calls
- ✅ No unnecessary image generation
- ✅ Reduced server load
- ✅ Lower costs (no repeated AI generations)

### Code Quality
- ✅ Predictable behavior
- ✅ Memoized functions
- ✅ Proper React patterns
- ✅ Easy to understand

## Alternative Solutions Considered

### ❌ Option 1: Remove Dependencies
```typescript
useEffect(() => {
  fetchGirls();
}, []); // Empty deps
```
**Why not?** Wouldn't wait for auth, would cause errors

### ❌ Option 2: Use Ref Instead of State
```typescript
const hasFetchedRef = useRef(false);
if (hasFetchedRef.current) return;
hasFetchedRef.current = true;
```
**Why not?** Refs don't trigger re-renders, harder to debug

### ✅ Option 3: State Flag + useCallback (Chosen)
**Why?** Best balance of React patterns, debuggability, and correctness

## Future Improvements

### 1. **Caching**
Cache generated girls for 5-10 minutes:
```typescript
const cacheKey = `girls_${user.id}`;
const cached = sessionStorage.getItem(cacheKey);
if (cached) {
  setGirls(JSON.parse(cached));
  return;
}
```

### 2. **Request Deduplication**
Prevent duplicate in-flight requests:
```typescript
const fetchPromiseRef = useRef<Promise<void> | null>(null);

if (fetchPromiseRef.current) {
  await fetchPromiseRef.current;
  return;
}

fetchPromiseRef.current = fetch(...);
await fetchPromiseRef.current;
fetchPromiseRef.current = null;
```

### 3. **React Query / SWR**
Use a data-fetching library:
```typescript
const { data: girls } = useQuery(['girls'], fetchGirls, {
  staleTime: 5 * 60 * 1000, // 5 min
  refetchOnMount: false,
});
```

## Summary

The infinite loop was caused by the `useEffect` hook re-triggering due to unstable dependencies and lack of a fetch guard. The fix implements:

1. **Fetch guard** with `hasFetched` state
2. **Memoized functions** with `useCallback`
3. **Immediate flag setting** to prevent race conditions

**Result:** Girls now generate exactly once per page load, as intended! 🎉

## Related Fixes

This fix builds on:
- ✅ Rate limiting improvements (RATE-LIMIT-FIX.md)
- ✅ Image preloading (IMAGE-PRELOADING-FIX.md)

Together, these create a smooth, professional girl selection experience.

