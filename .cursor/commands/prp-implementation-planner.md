# Create Implementation Plan from PRD and API Contracts

Generate a comprehensive, phase-by-phase implementation plan for building the application based on the PRD and API contracts.

## Arguments
- **PRD File**: $ARG1
- **API Contracts**: $ARG2

## Execution Control
Run this command as ToDo lists task - split the work into many specific tasks and phases.

## Analysis Process

### 1. Deep Document Analysis
- **Read and Understand PRD**:
  - Extract all epics, user stories, and acceptance criteria
  - Identify core features vs. enhancements
  - Note all technical requirements
  - Map business objectives to technical implementations
  - Extract success metrics and KPIs
  
- **Parse API Contracts**:
  - Catalog all endpoints, methods, and schemas
  - Map endpoints to user stories
  - Identify data models and relationships
  - Note authentication/authorization requirements
  - Extract validation rules and constraints

### 2. Dependency Mapping
- **Technical Prerequisites**:
  - Core infrastructure setup
  - Database schema requirements
  - Authentication/authorization systems
  - External service integrations
  - Development environment setup

- **Feature Dependencies**:
  - Which features depend on others
  - Which can be built in parallel
  - What constitutes MVP vs. enhancements
  - Data migration needs
  - API versioning considerations

### 3. Architecture Planning
- **System Components**:
  - Frontend structure and organization
  - Backend services and layers
  - Database design and migrations
  - API gateway and middleware
  - State management approach
  - Caching strategy

- **Integration Points**:
  - Third-party services
  - Internal microservices
  - Event-driven components
  - Real-time features

## Implementation Plan Generation

### Phase Structure Template

Each phase should follow this structure:

```markdown
## Phase [N]: [Phase Name]

### Overview
**Goal**: [What this phase achieves]
**Duration Estimate**: [Relative complexity: Simple/Medium/Complex]
**Success Criteria**: 
- [ ] [Measurable outcome 1]
- [ ] [Measurable outcome 2]
- [ ] [Measurable outcome 3]

**Dependencies**: 
- Phase [X]: [Dependency description]
- External: [Any external dependencies]

**Deliverables**:
- [Concrete deliverable 1]
- [Concrete deliverable 2]

### Technical Foundation
[Detailed explanation of the technical approach for this phase]

**Key Technologies/Patterns**:
- Technology 1: Why and how it's used
- Technology 2: Why and how it's used

**Architecture Decisions**:
- Decision 1 with rationale
- Decision 2 with rationale

---

### Step [N.1]: [Step Name]

**Objective**: [Specific goal of this step]

**Implementation Details**:

1. **Setup/Preparation**
   ```
   - Specific file to create: path/to/file
   - Configuration needed
   - Dependencies to install
   ```

2. **Core Implementation**
   ```
   - Component/Module to build
   - Key functions/methods needed
   - Data structures to define
   ```

3. **Integration Points**
   ```
   - APIs to consume/expose
   - Events to emit/listen
   - Services to connect
   ```

**Code Structure**:
```
Expected file structure:
src/
  ├── feature/
  │   ├── components/
  │   ├── services/
  │   └── types/
```

**API Endpoints Used** (from contracts):
- `METHOD /endpoint/path` - Purpose and usage
- `METHOD /another/path` - Purpose and usage

**Data Models Required**:
```typescript
// Example type/interface definitions
interface ModelName {
  field1: type;
  field2: type;
}
```

**Validation**:
```bash
# Commands to verify this step
npm run lint
npm run typecheck
npm test -- specific-test-suite
```

**Acceptance Criteria**:
- [ ] Specific testable requirement 1
- [ ] Specific testable requirement 2
- [ ] Integration with [component] verified

**Common Pitfalls**:
- ⚠️ Watch out for [common mistake]
- ⚠️ Remember to [important detail]

**Reference PRD Sections**: 
- Epic [X], Story [Y]
- Section: [Specific PRD section name]

---

[Repeat Step structure for all steps in phase]

### Phase [N] Completion Checklist
- [ ] All steps implemented and tested
- [ ] Integration tests passing
- [ ] Documentation updated
- [ ] Code reviewed
- [ ] Performance validated
- [ ] Security considerations addressed

---

[Repeat Phase structure for all phases]
```

## Phasing Strategy

### Phase Ordering Principles

1. **Phase 0: Foundation** (Always first)
   - Project setup and tooling
   - Development environment
   - CI/CD pipeline basics
   - Core infrastructure
   - Database setup

2. **Phase 1: Core Data Layer**
   - Database schemas and migrations
   - Core data models
   - Repository pattern/data access
   - Basic CRUD operations

3. **Phase 2: Authentication & Authorization**
   - User management
   - Auth flows
   - Permission systems
   - Session management

4. **Phase 3-N: Feature Implementation**
   - Order by dependency
   - MVP features first
   - Group related features
   - Consider technical complexity

5. **Final Phases: Polish & Enhancement**
   - Performance optimization
   - Error handling improvements
   - Enhanced user experience
   - Advanced features

### Step Ordering Within Phases

For each step, consider:
1. **Backend First**: API endpoints, business logic, data layer
2. **Frontend Second**: UI components consuming the APIs
3. **Integration Third**: Connect frontend to backend
4. **Testing Last**: Unit tests, integration tests, E2E tests

## Quality Requirements

### For Each Phase
- Clear, measurable objectives
- Explicit dependencies listed
- Realistic scope (not too large)
- Defined success criteria
- Complete technical explanation

### For Each Step
- Specific, actionable instructions
- Clear file paths and structure
- Referenced API contracts
- Code examples where helpful
- Validation commands (runnable by AI)
- Linked to PRD user stories
- Common pitfalls documented

### Cross-References
- Map each step to specific PRD sections
- Reference specific API endpoints from contracts
- Link related steps across phases
- Note integration points between features

## Output Structure

```markdown
# Implementation Plan: [Project Name]

## Executive Summary
- Total Phases: [N]
- MVP Completion: Phase [X]
- Full Feature Set: Phase [Y]
- Critical Path: [Key dependencies]

## Quick Reference

### Phase Overview
| Phase | Name | Complexity | Dependencies | Key Deliverables |
|-------|------|------------|--------------|------------------|
| 0 | Foundation | Simple | None | Setup, DB, Auth scaffold |
| 1 | ... | ... | ... | ... |

### API Contract Coverage
| Endpoint | Phase | Step | Purpose |
|----------|-------|------|---------|
| POST /api/users | 2 | 2.1 | User registration |
| ... | ... | ... | ... |

### PRD Story Coverage
| Epic | Story | Phase | Step | Status |
|------|-------|-------|------|--------|
| 1 | 1.1 | 3 | 3.2 | Planned |
| ... | ... | ... | ... | ... |

---

## Detailed Implementation Plan

[All phases with detailed steps as per template above]

---

## Appendix

### Technology Stack Summary
- Frontend: [Technologies]
- Backend: [Technologies]
- Database: [Technologies]
- DevOps: [Technologies]

### External Dependencies
- [Service/Library 1]: Purpose
- [Service/Library 2]: Purpose

### Risk Mitigation
| Risk | Impact | Mitigation | Phase |
|------|--------|------------|-------|
| ... | ... | ... | ... |

### Performance Considerations
- [Consideration 1]: Addressed in Phase [X]
- [Consideration 2]: Addressed in Phase [Y]

### Security Checklist
- [ ] Authentication implemented (Phase 2)
- [ ] Authorization enforced (Phase 2)
- [ ] Input validation (All phases)
- [ ] SQL injection prevention (Phase 1)
- [ ] XSS prevention (Frontend phases)
- [ ] CSRF protection (Phase 2)
- [ ] Rate limiting (Phase 3)
- [ ] Secure headers (Phase 0)
```

Save as: `PRPs/IMPLEMENTATION-PLAN-v1.md`

## User Interaction Points

1. **Initial Review**
   - Present phase overview
   - Confirm approach and priorities
   - Validate technical decisions

2. **Dependency Validation**
   - Review critical path
   - Confirm parallel work opportunities
   - Identify potential blockers

3. **Scope Agreement**
   - Clarify MVP boundaries
   - Confirm enhancement priorities
   - Set phase completion criteria

## Assembly Best Practices

**Use incremental updates** following the guidelines from prp-planning-create:

✅ **DO:**
- Build plan section by section
- Add one phase at a time
- Add steps incrementally within each phase
- Use unique anchors for each update
- Keep each update under 150 lines

❌ **DON'T:**
- Try to write the entire plan at once
- Make massive multi-phase updates
- Use generic search strings

**Recommended Assembly Order:**
1. Create document structure with phase headers
2. Add executive summary
3. Add quick reference tables (incrementally)
4. Add each phase overview (one at a time)
5. Add steps to each phase (one step at a time)
6. Add appendix sections
7. Final review and refinement

## Quality Checklist

- [ ] All PRD user stories mapped to phases/steps
- [ ] All API endpoints from contracts referenced
- [ ] Dependencies clearly identified
- [ ] Each step has validation commands
- [ ] Chronological order is logical
- [ ] No circular dependencies
- [ ] MVP clearly defined
- [ ] Success criteria measurable
- [ ] Common pitfalls documented
- [ ] Code structure examples included
- [ ] Integration points noted
- [ ] Security considerations included
- [ ] Performance implications addressed
- [ ] Each phase has clear deliverables

Remember: This plan becomes the blueprint for execution - make it comprehensive, clear, and actionable.
