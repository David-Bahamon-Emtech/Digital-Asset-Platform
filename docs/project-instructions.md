# Digital Asset Platform - Project Instructions

## Project Overview
A comprehensive Digital Asset Platform designed specifically for Commercial Banks and Central Banks to manage digital assets, facilitate various banking operations, and ensure regulatory compliance across multiple blockchain networks and financial systems.

## Project Goals
1. Enable banks to manage digital assets across multiple blockchain networks
2. Provide account management for different client and internal account types
3. Facilitate secure payment processing across various payment rails
4. Implement custody management solutions with integration capabilities
5. Support treasury process management and optimization
6. Ensure robust compliance monitoring and reporting
7. Allow flexible integration with third-party vendors for:
   - Blockchain networks for asset issuance
   - Payment venues and networks
   - Custody service providers
   - Liquidity and investment portfolio management services

## Development Approach
We'll follow a highly iterative, discovery-based development process:
1. Begin with foundational components and discover necessary modules as we progress
2. Develop each feature independently within its own GitHub branch/issue
3. Implement screen-by-screen with incremental functionality
4. Maintain rigorous version control to prevent message/token limit issues
5. Document thoroughly at each step
6. Regular integration testing between modules
7. Adaptive planning based on emerging requirements

## Technical Stack
- Frontend: React.js with TypeScript
- Backend: Node.js with Express
- Database: PostgreSQL for relational data, MongoDB for document storage
- Security: End-to-end encryption, HSM integration capabilities
- Version Control: GitHub with structured branching strategy
- Deployment: AWS or Azure cloud infrastructure (bank-grade security)

## Initial Focus Areas
1. Basic authentication and authorization
2. Core platform infrastructure
3. First user interface screens and workflows

## Modular Development Strategy
Rather than predefined modules, we'll:
1. Create a flexible GitHub repository structure that can adapt as we discover requirements
2. Build foundational components first
3. Identify and develop new modules as needed
4. Document architecture decisions as they evolve

## GitHub Organization Strategy
1. **Repository Structure**:
   - Main repository with capability to add components as discovered
   - Feature branches for each development effort
   
2. **Issue Management**:
   - GitHub issues created for each new feature or component
   - Use of epics/milestones to group related work
   - Labels to categorize and prioritize work

3. **Code Management**:
   - Structured pull request process
   - Code review requirements
   - Compartmentalized code to manage complexity and avoid token limits

4. **Documentation**:
   - Progressive documentation approach
   - Architecture decision records
   - Development guides updated as patterns emerge

## Implementation Approach
1. Set up GitHub repository and initial project structure
2. Implement basic authentication framework
3. Build foundational UI components
4. Develop core functionality incrementally
5. Add modules and features based on emerging requirements
6. Continually refine and refactor as the system grows
