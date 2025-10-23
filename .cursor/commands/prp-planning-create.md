# Create PLANNING PRP (Advanced)

Transform rough ideas into comprehensive PRDs with rich visual documentation.

## Idea: $ARGUMENTS

## Discovery Process

1. **Concept Expansion**
   - Break down the core idea
   - Define success criteria
   - Map to business goals if provided

2. **Market & Technical Research**
   - Do deep web search for the following:
     - Market analysis
     - Competitor analysis
     - Technical feasibility study
     - Best practice examples
     - Integration possibilities

3. **User Research & Clarification**
     - Ask user for the following if not provided:
     - Target user personas?
     - Key pain points?
     - Success metrics?
     - Constraints/requirements?

## Execution Control
Run this command as ToDo lists task - split the work into many specific tasks.

## PRD Generation

Using /PRPs/templates/prp_planning.md:

### Visual Documentation Plan
```yaml
diagrams_needed:
  user_flows:
    - Happy path journey
    - Error scenarios
    - Edge cases
  
  architecture:
    - System components
    - Data flow
    - Integration points
  
  sequences:
    - API interactions
    - Event flows
    - State changes
  
  data_models:
    - Entity relationships
    - Schema design
    - State machines
```

### Research Integration
- **Market Analysis**: Include findings in PRD
- **Technical Options**: Compare approaches
- **Risk Assessment**: With mitigation strategies
- **Success Metrics**: Specific, measurable

```markdown
## Epic: [High-level feature]

### Story 1: [User need]
**As a** [user type]
**I want** [capability]
**So that** [benefit]

**Acceptance Criteria:**
- [ ] Specific behavior
- [ ] Edge case handling
- [ ] Performance requirement

**Technical Notes:**
- Implementation approach
- API implications
- Data requirements
```

### Implementation Strategy
- Phases with dependencies (no dates)
- Priority ordering
- MVP vs enhanced features
- Technical prerequisites

## User Interaction Points

1. **Idea Validation**
   - Confirm understanding
   - Clarify ambiguities
   - Set boundaries

2. **Research Review**
   - Share findings
   - Validate assumptions
   - Adjust direction

3. **PRD Draft Review**
   - Architecture approval
   - Risk acknowledgment
   - Success metric agreement

## Diagram Guidelines
- Use Mermaid for all diagrams
- Include legends where needed
- Show error paths
- Annotate complex flows

# PRD Assembly Best Practices

## Critical Guidelines for Large Document Creation

### File Writing Best Practices

**NEVER attempt to write large PRD documents in single operations.** Always use incremental, surgical updates.

## Strategy 1: Incremental Section Updates (Recommended)

Break PRD assembly into small, focused updates:

✅ **DO: Make 20-50 small targeted updates**
- Update Executive Summary (1 search_replace call)
- Update User Story 1.1 (1 search_replace call)
- Update User Story 1.2 (1 search_replace call)
- Add Epic 2 stories one by one
- Update each diagram individually
- Add API endpoints one at a time

❌ **DON'T: Try to write 500+ lines in one call**
- Don't replace entire large sections at once
- Don't pass massive JSON strings with nested content
- Don't attempt to create complete PRD in 1-2 operations

## Strategy 2: Unique Search Anchors

Ensure each `search_replace` call uses unique, specific anchors:

✅ **DO: Use specific, unique strings**
```
old_string: "### Success Metrics\n\n**User Acquisition:**"
```
(This appears only once in the document)

❌ **DON'T: Use generic strings that appear multiple times**
```
old_string: "## User Stories"
```
(Could match many section headers)

## Strategy 3: Handle Special Content Carefully

### For Mermaid Diagrams:
- Update each diagram separately
- Use surrounding text as unique anchors
- Keep old_string small (just the diagram + immediate context)

### For Code Blocks:
- Replace API endpoints individually
- Use the endpoint path as unique identifier

### For Tables:
- Update tables row by row or as small groups
- Use table header + first row as anchor if needed

## Strategy 4: Size Limits

Keep individual tool call parameters under these limits:

- `old_string`: < 100 lines preferred, max 200 lines
- `new_string`: < 150 lines preferred, max 250 lines
- Total JSON parameter size: < 15KB per call

**If a section is larger, split it into multiple consecutive updates.**

## Strategy 5: Sequential Updates

When adding new content:

1. **First update:** Add section header
2. **Second update:** Add first subsection
3. **Third update:** Add next subsection
4. **Continue incrementally**

This makes each step smaller and easier to debug if issues occur.

## Strategy 6: Validate Before Proceeding

After every 5-10 updates:
- Confirm the file is being updated correctly
- Check for any syntax errors
- Verify diagrams render properly

## Example: Adding a New Epic with 3 User Stories

```markdown
Step 1: Add Epic header
search_replace(
  old_string: "---\n\n## User Flow Diagrams",
  new_string: "---\n\n### Epic 7: New Feature\n\n---\n\n## User Flow Diagrams"
)

Step 2: Add Story 7.1
search_replace(
  old_string: "### Epic 7: New Feature\n\n---",
  new_string: "### Epic 7: New Feature\n\n#### Story 7.1: [Title]\n[Content]\n\n---"
)

Step 3: Add Story 7.2
search_replace(
  old_string: "[Story 7.1 content]\n\n---",
  new_string: "[Story 7.1 content]\n\n#### Story 7.2: [Title]\n[Content]\n\n---"
)

Step 4: Add Story 7.3
(Similar pattern)
```

## Error Recovery

If you encounter "Model failed to call the tool with correct arguments":

1. **Identify the problem**: Content too large or complex JSON escaping
2. **Break it down**: Split the update into 2-3 smaller updates
3. **Simplify anchors**: Use shorter, more unique search strings
4. **Continue**: Don't restart; just make the next update smaller

## Performance Tips

- Use TODO lists to track all incremental updates needed
- Complete TODOs as each update succeeds
- Batch related updates together (all user stories for one epic)
- Update similar content types together (all API endpoints, then all diagrams)

## Time Management

For large PRDs (500+ lines):
- Expect 30-50 individual file operations
- Each operation takes 2-5 seconds
- Total assembly time: 3-5 minutes
- This is NORMAL and EXPECTED for quality results

## Critical Rule

**Remember**: Slow and steady with many small updates is faster and more reliable than attempting large updates that fail and require retries.

**Always prefer 50 small successful updates over 1 large failed update.**

## Real-World Example

✅ **What worked:**
- Made 25+ individual targeted updates
- Each update was 10-50 lines
- Updated one section at a time
- Used unique anchors for each update
- Tracked progress with TODO list
- Total time: ~4 minutes
- Success rate: 100%

❌ **What would have failed:**
- Trying to write entire PRD at once
- Replacing 500+ line sections
- Using generic search strings
- Not tracking progress
- Expected result: Multiple failures, timeouts, frustration

## Summary

| Approach | Updates | Avg Size | Success Rate | Time |
|----------|---------|----------|--------------|------|
| ❌ Large batches | 3-5 | 500+ lines | 20% | 10+ min (with retries) |
| ✅ Small incremental | 30-50 | 20-50 lines | 98% | 3-5 min |

**Choose the incremental approach every time.**

## Assembly Step
Once all sections above have been completed and reviewed, the agent should display:
“Generating the final consolidated PRD now”
Doesn't need user confirmation to proceed.

## Output Structure
```markdown
1. Executive Summary
2. Problem & Solution
3. User Stories (with diagrams)
4. Technical Architecture (with diagrams)
5. API Specifications
6. Data Models
7. Implementation Phases
8. Risks & Mitigations
9. Success Metrics
10. Appendices
```

Save as: `PRPs/PRD-v1.md`

## Quality Checklist
- [ ] Problem clearly articulated
- [ ] Solution addresses problem
- [ ] All user flows diagrammed
- [ ] Wireframes included if needed
- [ ] Architecture visualized
- [ ] APIs fully specified with examples
- [ ] Data models included
- [ ] Dependencies identified
- [ ] Risks identified and mitigated
- [ ] Success metrics measurable
- [ ] Implementation phases logical
- [ ] Ready for implementation PRP

Remember: Great PRDs prevent implementation confusion.