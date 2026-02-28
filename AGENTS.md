```markdown
# AGENTS.md Guidelines

## 1. DRY (Don't Repeat Yourself)

All code within this repository must be unique and avoid duplication.  Solutions to similar problems should be consolidated into reusable components or functions.  Maintainability is paramount.  Any code that could be easily replicated should be handled as a single unit.

## 2. KISS (Keep It Simple, Stupid)

Code should be as concise and understandable as possible while still achieving its intended purpose. Favor simplicity over complexity where feasible.  Avoid overly intricate logic or abstractions unless absolutely necessary for clarity.

## 3. SOLID Principles

*   **Single Responsibility Principle:** Each class/module/function should have one and only one reason to change.
*   **Open/Closed Principle:** The system should be open for extension but closed for modification.  New functionality should be added without altering existing code.
*   **Liskov Substitution Principle:**  Subclasses must be substitutable for their base classes without altering the correctness of the program.
*   **Interface Segregation Principle:** Client code should not be forced to depend on methods it doesn’t use.
*   **Dependency Inversion Principle:** High-level modules (classes) should not depend on low-level modules (classes).  They should depend on abstractions.

## 4. YAGNI (You Aren't Gonna Need It)

Avoid adding functionality or code that is not currently required for the current implementation or intended purpose.  Premature optimization and overly complex solutions are detrimental.  Focus on providing the essential functionality; if new requirements emerge, add them later, when needed.

## 5. Testing & Code Quality

*   **All development must be productive.**  Prioritize functionality over perfection during development.
*   **Unit Tests:**  Comprehensive unit tests must be included for every function/class/module. Each module should have at least 80% test coverage.  Test cases should clearly define expected inputs and outputs.
*   **Test Driven Development (TDD):** Adhere to a TDD approach where tests are written before code.  A core component of the codebase should be testable.
*   **Mocking:** Use mocks and stubs *exclusively* for integration and testing purposes. Do not include real implementations.
*   **Code Review:** All code must undergo a thorough code review process, conducted by at least two developers.

## 6. File Structure & Size

*   **Maximum File Length:** Each file must be no more than 180 lines of code.
*   **Directory Structure:**  Maintain a well-defined directory structure that reflects the organization of the codebase.
*   **Naming Conventions:**  Follow consistent naming conventions throughout the repository (e.g., camelCase, snake_case).
*   **Comments:**  Provide clear and concise comments where appropriate, but avoid excessive commenting.  Focus on explaining *why* the code is doing something, not *what* it is doing.
*   **Modularization:** Break down large files into smaller, more manageable modules with well-defined responsibilities.

## 7. Specific Considerations (Example - Adjust as needed)

*   **Data Models:**  Clearly define data models using classes or structs.
*   **API Design:**  Implement a robust API design, adhering to established best practices.
*   **Error Handling:**  Implement comprehensive error handling and logging.
*   **Configuration Management:** Utilize a configuration management system to enable easy modification of settings.
*   **Versioning:** Implement a clear versioning system to manage changes effectively.

## 8.  Code Style & Linting

*   All code must adhere to the defined coding style guidelines.
*   Utilize a linter (e.g., pylint, eslint) to automatically check for style and potential errors.
*   Run the linter *before* committing code to ensure adherence to the style.

## 9.  Documentation (If Applicable - Use sparingly)

*   Include a brief README with instructions for running the codebase and any relevant documentation.

```