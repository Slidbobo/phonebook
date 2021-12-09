import PhoneBook from "./index";
import {
  findByRole,
  fireEvent,
  getAllByLabelText,
  getAllByRole,
  getByLabelText,
  getByRole,
  getByText,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from "@testing-library/react";

const addContactFn = async () => {
  // Click button to open the modal
  const addContactButton = screen.getByText(/add contact/i);
  fireEvent.click(addContactButton);

  // Stores the modal element in a variable
  const contactAddModal = screen.getByLabelText("modal-add-contact");

  // Searches and fills the text field for the first name in the modal
  const inputFirstName = getByRole(contactAddModal, "textbox", {
    name: "First Name",
  });
  fireEvent.change(inputFirstName, { target: { value: "John" } });

  // Searches and fills the text field for the last name in the modal
  const inputLastName = getByRole(contactAddModal, "textbox", {
    name: "Last Name",
  });
  fireEvent.change(inputLastName, { target: { value: "Doe" } });

  // Opens the options of the label for the first phone number in the modal
  const firstLabel = getByRole(
    getByLabelText(contactAddModal, "phoneNumbers-0-label"),
    "button"
  );
  fireEvent.mouseDown(firstLabel);

  // Searches, fills and verifies the text fields for the phone numbers in the modal
  getAllByRole(contactAddModal, "textbox", { name: "Phone Number" }).map(
    (phoneNumber, index) => {
      fireEvent.change(phoneNumber, {
        target: { value: "+49 (0)171 / 987 654 321" },
      });
    }
  );

  // Click button to open the modal
  const submitContact = getByLabelText(contactAddModal, "submit-contact");
  fireEvent.click(submitContact);

  await waitForElementToBeRemoved(() =>
    screen.queryByLabelText("modal-add-contact")
  );
};

test("Open modal for add or update contact", async () => {
  render(<PhoneBook />);

  // Verifies that the modal does not exist
  expect(screen.queryByLabelText("modal-add-contact")).not.toBeInTheDocument();

  // Click button to open the modal
  const button = screen.getByText(/add contact/i);
  fireEvent.click(button);

  // Verifies that the modal does exist now
  expect(screen.getByLabelText("modal-add-contact")).toBeInTheDocument();
});

test("Open modal and add a contact with two phone numbers", async () => {
  render(<PhoneBook />);

  // Click button to open the modal
  const addContactButton = screen.getByText(/add contact/i);
  fireEvent.click(addContactButton);

  // Stores the modal element in a variable
  const contactAddModal = screen.getByLabelText("modal-add-contact");

  // Searches, fills and verifies the text field for the first name in the modal
  const inputFirstName = getByRole(contactAddModal, "textbox", {
    name: "First Name",
  });
  fireEvent.change(inputFirstName, { target: { value: "John" } });
  expect(inputFirstName.value).toBe("John");

  // Searches, fills and verifies the text field for the last name in the modal
  const inputLastName = getByRole(contactAddModal, "textbox", {
    name: "Last Name",
  });
  fireEvent.change(inputLastName, { target: { value: "Doe" } });
  expect(inputLastName.value).toBe("Doe");

  // Verifies that only one phone number exists
  expect(
    getAllByLabelText(contactAddModal, /phoneNumbers-[0-9]+-label/i)
  ).toHaveLength(1);

  // Adds a second phone number
  const oneMoreNumberButton = screen.getByText(/one more number/i);
  fireEvent.click(oneMoreNumberButton);

  // Get all phone number labels
  const allPhoneNumberLabels = getAllByLabelText(
    contactAddModal,
    /phoneNumbers-[0-9]+-label/i
  );

  // Verifies that the second phone number was added
  expect(allPhoneNumberLabels).toHaveLength(2);

  // Opens the options of the label for the first phone number in the modal
  const firstLabel = getByRole(
    getByLabelText(contactAddModal, "phoneNumbers-0-label"),
    "button"
  );
  fireEvent.mouseDown(firstLabel);

  // Select the label "work" for the first phone number
  const allOptions = screen.getAllByRole("option");
  fireEvent.click(
    allOptions.reduce((prevOption, currentOption) => {
      if (currentOption.dataset.value === "work") return currentOption;
      return prevOption;
    })
  );

  // Searches, fills and verifies the text fields for the phone numbers in the modal
  getAllByRole(contactAddModal, "textbox", { name: "Phone Number" }).map(
    (phoneNumber, index) => {
      const inputValue = index
        ? "+49 (0)30 / 123 456 789"
        : "+49 (0)171 / 987 654 321";
      fireEvent.change(phoneNumber, { target: { value: inputValue } });
      expect(phoneNumber.value).toBe(inputValue);
    }
  );

  // Click button to open the modal
  const submitContact = getByLabelText(contactAddModal, "submit-contact");
  fireEvent.click(submitContact);

  await waitForElementToBeRemoved(() =>
    screen.queryByLabelText("modal-add-contact")
  );

  const contactTableBody = screen.getByLabelText(/contact table body/i);

  // Verifies that the contact with two phone numbers was added
  expect(getByText(contactTableBody, "John")).toBeInTheDocument();
  expect(getByText(contactTableBody, "Doe")).toBeInTheDocument();
  expect(getByText(contactTableBody, "Work")).toBeInTheDocument();
  expect(
    getByText(contactTableBody, "+49 (0)30 / 123 456 789")
  ).toBeInTheDocument();
  expect(getByText(contactTableBody, "Mobile")).toBeInTheDocument();
  expect(
    getByText(contactTableBody, "+49 (0)171 / 987 654 321")
  ).toBeInTheDocument();
});
