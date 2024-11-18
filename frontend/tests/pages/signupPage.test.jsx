import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { useNavigate } from "react-router-dom";
import { signup } from "../../src/services/authentication";
import { SignupPage } from "../../src/pages/Signup/SignupPage";
import { MemoryRouter } from 'react-router-dom'; 

// Mocking React Router's useNavigate function
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  const navigateMock = vi.fn();
  const useNavigateMock = () => navigateMock;
  return {
    ...actual,
    Link: actual.Link,  // Keep the original Link component
    useNavigate: useNavigateMock, // Mock useNavigate if needed
  };
});

// Mocking the signup service
vi.mock("../../src/services/authentication", () => {
  const signupMock = vi.fn();
  return { signup: signupMock };
});

// Reusable function for filling out signup form
async function completeSignupForm() {
  const user = userEvent.setup();

  //filling the form
  const emailInputEl = screen.getByLabelText("Email:");
  const passwordInputEl = screen.getByLabelText("Password:");
  const usernameInputEl = screen.getByLabelText("Username:");
  const firstNameInputEl = screen.getByLabelText("First name:");
  const lastNameInputEl = screen.getByLabelText("Last name:");
  const pronounsInputEl = screen.getByLabelText("Pronouns:");
  const birthdayInputEl = screen.getByLabelText("Birthday:");

  // submitting the form
  const submitButtonEl = screen.getByRole("submit-button");

  await user.type(emailInputEl, "test@email.com");
  await user.type(passwordInputEl, "1234");
  await user.type(usernameInputEl, "TestUsername");
  await user.type(firstNameInputEl, "TestFirstName");
  await user.type(lastNameInputEl, "TestLastName");
  await user.type(pronounsInputEl, "TestPronouns");
  await user.type(birthdayInputEl, "2001-01-01");

  await user.click(submitButtonEl);
}



describe("Signup Page", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('renders SignupPage without crashing', () => {
    render(
      <MemoryRouter>
        <SignupPage />
      </MemoryRouter>
    );
  });

  test("allows a user to signup", async () => {
    render(
      <MemoryRouter>
        <SignupPage />
      </MemoryRouter>
    );
    await completeSignupForm();

    expect(signup).toHaveBeenCalledWith("test@email.com", "1234", "TestUsername", "TestFirstName", "TestLastName", "TestPronouns", "2001-01-01");
  });

  test("navigates to /login on successful signup", async () => {
    render(
      <MemoryRouter>
        <SignupPage />
      </MemoryRouter>
    );

    await completeSignupForm();
    const navigateMock = useNavigate();
    expect(navigateMock).toHaveBeenCalledWith("/login");
  });

  test("navigates to /signup on unsuccessful signup", async () => {
    render(
      <MemoryRouter>
        <SignupPage />
      </MemoryRouter>
    );
    signup.mockRejectedValue(new Error("Error signing up"));


    await completeSignupForm();
    const navigateMock = useNavigate();
      expect(navigateMock).toHaveBeenCalledWith("/signup");
    });
  
  

  test("shows error for invalid email format", async () => {
    render(
      <MemoryRouter>
        <SignupPage />
      </MemoryRouter>
    );    const user = userEvent.setup();
    
    // Filling in other valid fields
    const emailInputEl = screen.getByLabelText("Email:");
    const passwordInputEl = screen.getByLabelText("Password:");
    const usernameInputEl = screen.getByLabelText("Username:");
    const firstNameInputEl = screen.getByLabelText("First name:");
    const lastNameInputEl = screen.getByLabelText("Last name:");
    const genderInputEl = screen.getByLabelText("Pronouns:");
    const birthdayInputEl = screen.getByLabelText("Birthday:");
    const submitButtonEl = screen.getByRole("submit-button");
    
    // Fill form with invalid email
    await user.type(emailInputEl, "invalid-email");
    await user.type(passwordInputEl, "1234");
    await user.type(usernameInputEl, "TestUsername");
    await user.type(firstNameInputEl, "TestFirstName");
    await user.type(lastNameInputEl, "TestLastName");
    await user.type(genderInputEl, "TestGender");
    await user.type(birthdayInputEl, "2001-01-01");
    
    // Submit form
    await user.click(submitButtonEl);
    
    // Assert that the email error message appears
    expect(screen.getByText("Please enter a valid email address")).to.exist;
  });


  test("shows error for invalid password format", async () => {
    render(
      <MemoryRouter>
        <SignupPage />
      </MemoryRouter>
    );    
    const user = userEvent.setup();
    
    // Filling in other valid fields
    const emailInputEl = screen.getByLabelText("Email:");
    const passwordInputEl = screen.getByLabelText("Password:");
    const usernameInputEl = screen.getByLabelText("Username:");
    const firstNameInputEl = screen.getByLabelText("First name:");
    const lastNameInputEl = screen.getByLabelText("Last name:");
    const genderInputEl = screen.getByLabelText("Pronouns:");
    const birthdayInputEl = screen.getByLabelText("Birthday:");
    const submitButtonEl = screen.getByRole("submit-button");
    
    // Fill form with invalid email
    await user.type(emailInputEl, "test@email.com");
    await user.type(passwordInputEl, "1234");
    await user.type(usernameInputEl, "TestUsername");
    await user.type(firstNameInputEl, "TestFirstName");
    await user.type(lastNameInputEl, "TestLastName");
    await user.type(genderInputEl, "TestGender");
    await user.type(birthdayInputEl, "2001-01-01");
    
    // Submit form
    await user.click(submitButtonEl);
    
    // Assert that the email error message appears
    expect(screen.getByText("Please insert at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character")).to.exist;
  });
});
