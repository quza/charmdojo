---
description: Verify consistency between PRD, PRP, API contract, and implementation plan documents. Ensures all feature descriptions, todos, APIs, and requirements align correctly.
---

# PRP Verifier Command

**Purpose**: Perform deep verification of document consistency across PRD, PRP, API contracts, and implementation plans. This command is thorough, detailed, and prioritizes accuracy over speed.

## Arguments

**Required:**
1. `<prd_path>` - Path to the Product Requirements Document (e.g., `PRPs/pronza-teaching-platform-prd.md`)
2. `<prp_path>` - Path to the specific PRP document (e.g., `PRPs/prp-001-authentication-user-management.md`)
3. `<api_contract_path>` - Path to the API contract document (e.g., `PRPs/contracts/authentication-api-contract.md`)

**Optional:**
4. `<mvp_plan_path>` - Path to the MVP implementation plan (e.g., `PRPs/pronza-mvp-implementation-plan.md`)

## Verification Scope

### 1. Cross-Document Consistency
- **Feature Alignment**: Verify all features described in PRD are accurately reflected in PRP
- **API Consistency**: Ensure API endpoints, methods, parameters, and responses in API contract match PRP requirements
- **Requirements Mapping**: Check that PRP implementation details fulfill PRD business requirements
- **Scope Verification**: If MVP plan is provided, verify PRP implements only MVP-scoped features
- **Terminology Consistency**: Ensure consistent use of terms, naming conventions, and domain language
- **User Stories**: Verify PRP implementation addresses all relevant user stories from PRD

### 2. Project Structure Compliance
Reference `PRPs/ai_docs/project-structure.md` to verify:
- **File Placement**: All file paths in PRP match the correct directory structure
- **Route Definitions**: API routes follow REST conventions and correct patterns
- **Import Patterns**: Code examples use `@/` alias correctly
- **Component Organization**: Components are placed in correct feature folders
- **Naming Conventions**: Files follow kebab-case, service patterns, etc.
- **Environment Variables**: Env vars follow `NEXT_PUBLIC_*` conventions
- **Middleware Location**: Critical files placed at correct levels

### 3. PRP Methodology Compliance
Verify PRP follows the framework requirements:
- **✅ Required Sections Present**:
  - Goal (specific end state)
  - Why (business value)
  - What (user-visible behavior)
  - All Needed Context (docs, examples, gotchas)
  - Implementation Blueprint (pseudocode, task lists)
  - Validation Loop (executable commands)
- **✅ Context is King**: Comprehensive documentation, examples, and caveats included
- **✅ Validation Gates**: All four levels present and executable (syntax/style, unit tests, integration, build)
- **✅ Information Density**: Uses keywords and patterns from codebase
- **✅ No Anti-Patterns**: No minimal context, no skipped validations, no hardcoded values

### 4. API Contract Verification
- **Endpoint Completeness**: All endpoints needed for PRP features are defined
- **Request/Response Schemas**: Properly defined with types, validation rules
- **Error Handling**: All error cases documented with appropriate status codes
- **Authentication**: Auth requirements clearly specified per endpoint
- **Rate Limiting**: Any rate limiting or throttling documented
- **Versioning**: API versioning strategy consistent

### 5. Technical Accuracy
- **Type Safety**: TypeScript types correctly defined and consistent
- **Database Schema**: References to Supabase tables/columns are accurate
- **Third-Party APIs**: Correct usage of Stripe, Agora, Supabase APIs
- **Security**: No exposed secrets, proper auth flows, secure patterns
- **Performance**: No obvious performance anti-patterns

### 6. Implementation Feasibility
- **Dependencies**: All required packages/services available
- **Complexity**: Implementation steps are realistic and achievable
- **Testing**: Tests can actually validate the requirements
- **Edge Cases**: Critical edge cases are addressed

## Execution Flow

### Phase 1: Deep Analysis
1. Load all provided documents
2. Load `PRPs/ai_docs/project-structure.md` for structure reference
3. Parse and extract:
   - PRD: Business requirements, user stories, feature descriptions
   - PRP: Implementation tasks, validation loops, context sections
   - API Contract: Endpoints, schemas, error handling
   - MVP Plan (if provided): Scope boundaries, phase definitions
4. Perform comprehensive cross-referencing and verification
5. Check each verification category systematically

### Phase 2: Issue Identification
Create a detailed report of ALL issues found:
- **Critical Issues**: Blocking problems that prevent implementation
- **High Priority**: Significant inconsistencies or methodology violations
- **Medium Priority**: Missing context, incomplete validation, minor inconsistencies
- **Low Priority**: Suggestions for improvement, style issues

### Phase 3: User Review
Present findings in this format:

```markdown
## Verification Report

### Summary
- Documents Verified: [list]
- Total Issues Found: [count]
- Critical: [count] | High: [count] | Medium: [count] | Low: [count]

### Critical Issues
[Detailed list with locations and explanations]

### High Priority Issues
[Detailed list with locations and explanations]

### Medium Priority Issues
[Detailed list with locations and explanations]

### Low Priority Issues
[Detailed list with locations and explanations]

### Recommendations
[Strategic recommendations for fixes]
```

**Then ask**: "I've found [count] issues that need correction. Shall I proceed with fixing them? I will modify the PRP and API contract documents (NOT the PRD unless critical), and create a detailed correction summary."

### Phase 4: Apply Corrections (After User Approval)
**Correction Priority**:
1. ✅ **Modify PRP**: Fix inconsistencies, add missing context, correct methodology violations
2. ✅ **Modify API Contract**: Fix endpoint definitions, schemas, error handling
3. ⚠️ **Modify PRD**: ONLY in extreme cases (e.g., fundamental logical errors) and preferably with user confirmation

**Correction Principles**:
- Preserve original intent and business requirements
- Add missing information rather than removing existing content
- Fix errors with minimal disruption
- Maintain document formatting and structure
- Keep changes traceable

### Phase 5: Create Correction Summary
Determine the next sequential correction number:
1. List all files in `PRPs/corrections/` 
2. Find highest numbered correction (e.g., `003_correction_payments.md` → 003)
3. Increment by 1 for new correction number

Create correction document: `PRPs/corrections/{NNN}_correction_{featureName}.md`

**Correction Document Format**:

```markdown
# Correction Summary: {Feature Name}

**Date**: {ISO Date}
**Correction Number**: {NNN}
**Verified By**: PRP Verifier Command
**Documents Corrected**: 
- PRP: {path}
- API Contract: {path}
- PRD: {path if modified}

---

## Executive Summary

Brief overview of verification scope and key findings.

---

## Issues Found

### Critical Issues ({count})

#### 1. {Issue Title}
- **Location**: {document}:{section or line reference}
- **Category**: {consistency/methodology/structure/technical}
- **Description**: Detailed explanation of the issue
- **Impact**: How this affects implementation
- **Root Cause**: Why this issue occurred

[Repeat for all critical issues]

### High Priority Issues ({count})
[Same format as above]

### Medium Priority Issues ({count})
[Same format as above]

### Low Priority Issues ({count})
[Same format as above]

---

## Corrections Applied

### PRP Modifications

#### Change 1: {Description}
- **File**: {prp_path}
- **Section**: {section name}
- **Type**: {Addition/Modification/Fix}

**Before:**
```markdown
{original content snippet}
```

**After:**
```markdown
{corrected content snippet}
```

**Reason**: {explanation of why this change was necessary}

[Repeat for all PRP changes]

### API Contract Modifications

#### Change 1: {Description}
[Same format as PRP modifications]

### PRD Modifications (if any)

#### Change 1: {Description}
[Same format with additional justification for PRD changes]

---

## Verification Checklist

- [ ] Cross-document consistency verified
- [ ] Project structure compliance checked
- [ ] PRP methodology compliance verified
- [ ] API contract accuracy confirmed
- [ ] Technical accuracy validated
- [ ] Implementation feasibility assessed
- [ ] All corrections applied and tested
- [ ] Documents remain internally consistent

---

## Follow-Up Actions

Recommended next steps:
1. {action item}
2. {action item}
3. {action item}

---

## Lessons Learned

Key insights to prevent similar issues in future PRPs:
- {lesson}
- {lesson}
- {lesson}

---

## Verification Metrics

- **Total Issues**: {count}
- **Issues Fixed**: {count}
- **Documents Modified**: {count}
- **Lines Changed**: {approximate count}
- **Time Spent**: {duration}

---

**End of Correction Summary**
```

## Best Practices for Using This Command

### When to Use
- ✅ Before starting PRP implementation
- ✅ After significant PRD updates
- ✅ When API contracts are finalized
- ✅ Before code review or PR submission
- ✅ When multiple documents feel out of sync

### What This Command Does NOT Do
- ❌ Generate new features not in PRD
- ❌ Make subjective design decisions
- ❌ Modify code files (only documentation)
- ❌ Auto-approve changes (always asks user)

### Tips for Best Results
- Run this command BEFORE starting implementation
- Have all documents ready and relatively complete
- Review the full report before approving corrections
- Use the correction summary as a learning tool
- Re-run after applying corrections to verify fixes

## Example Usage

```bash
# Verify authentication feature with all documents
/prp-verifier PRPs/pronza-teaching-platform-prd.md PRPs/prp-001-authentication-user-management.md PRPs/contracts/authentication-api-contract.md PRPs/pronza-mvp-implementation-plan.md

# Verify without MVP plan
/prp-verifier PRPs/pronza-teaching-platform-prd.md PRPs/prp-002-teacher-profiles.md PRPs/contracts/teacher-api-contract.md
```

## Integration with PRP Workflow

This command fits into the PRP lifecycle:

1. **Create PRP** → `/prp-base-create`
2. **Create API Contract** → Manual or via `/prp-spec-create`
3. **✨ VERIFY** → `/prp-verifier` ← **YOU ARE HERE**
4. **Execute PRP** → `/prp-base-execute`
5. **Review Changes** → `/review-staged-unstaged`
6. **Create PR** → `/create-pr`

## Output Artifacts

After successful execution:
1. ✅ Corrected PRP document (if issues found)
2. ✅ Corrected API contract document (if issues found)
3. ✅ Correction summary in `PRPs/corrections/{NNN}_correction_{feature}.md`
4. ✅ Terminal summary of all changes made

## Error Handling

If verification cannot complete:
- **Missing Documents**: Clear error about which files don't exist
- **Malformed Documents**: Identify parsing issues and locations
- **Conflicting Requirements**: Highlight contradictions for user resolution
- **Unclear Scope**: Ask clarifying questions before proceeding

---

## Command Implementation Notes for AI Agent

### Key Principles
1. **Be Thorough**: This is NOT a quick check - spend time on deep analysis
2. **Be Precise**: Reference exact locations (line numbers, sections)
3. **Be Helpful**: Explain WHY something is an issue, not just WHAT
4. **Be Conservative**: Don't modify PRD unless absolutely necessary
5. **Be Transparent**: Always show user what will change before changing it

### Verification Strategy
1. Parse all documents into structured data
2. Create cross-reference map of features → requirements → APIs → tasks
3. Check each requirement has implementation path
4. Check each API endpoint has purpose in PRD
5. Check each PRP task fulfills a requirement
6. Validate all code examples against project structure
7. Verify all validation loops are executable

### When Asking for User Approval
Present a clear, concise summary:
- Number of issues by priority
- Scope of changes (which documents)
- No surprises in actual changes

### Creating Directory if Needed
If `PRPs/corrections/` doesn't exist:
```bash
mkdir -p PRPs/corrections
```

---

**End of Command Documentation**

*This command embodies the PRP principle: "Context is King" by ensuring all documentation is consistent, complete, and correct before implementation begins.*

