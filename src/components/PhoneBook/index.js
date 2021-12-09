import { forwardRef, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  MenuItem,
  Modal,
  Select,
  Slide,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { Add, Cancel, Delete, Edit, Update } from "@mui/icons-material";
import { Formik, Form, Field, FieldArray } from "formik";
import * as Yup from "yup";
import uuid from "react-uuid";

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const labelOptions = [
  {
    value: "mobile",
    label: "Mobile",
  },
  {
    value: "private",
    label: "Private",
  },
  {
    value: "work",
    label: "Work",
  },
];

const initialAddContactValues = {
  firstName: "",
  lastName: "",
  phoneNumbers: [
    {
      label: "mobile",
      number: "",
    },
  ],
};

const validationSchema = Yup.object().shape({
  firstName: Yup.string().required("Please enter your first name."),
  lastName: Yup.string().required("Please enter your last name."),
  phoneNumbers: Yup.array()
    .of(
      Yup.object().shape({
        number: Yup.string().required("Please enter your phone number."),
      })
    )
    .min(1, "Please enter at least one phone number."),
});

const modalStyle = {
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  boxSizing: "border-box",
  left: "50%",
  maxHeight: "calc(100vh - 4rem)",
  maxWidth: 600,
  overflowY: "scroll",
  p: 4,
  position: "absolute",
  marginTop: "2rem",
  transform: "translate(-50%, 0)",
  width: "100%",
};

const PhoneBook = () => {
  const [contacts, setContacts] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [modalFormObject, setModalFormObject] = useState(
    initialAddContactValues
  );
  const [isNewContact, setIsNewContact] = useState(true);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [shouldBeDeleted, setShouldBeDeleted] = useState(null);

  const handleOpenModalAdd = () => {
    setIsNewContact(true);
    let newContact = initialAddContactValues;
    newContact.id = uuid();
    newContact.phoneNumbers[0].id = uuid();
    setModalFormObject(newContact);
    setOpenModal(true);
  };

  const handleOpenModalUpdate = (contactId) => {
    setIsNewContact(false);
    setModalFormObject(
      contacts.reduce((prevContact, currentContact) =>
        currentContact.id === contactId ? currentContact : prevContact
      )
    );
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setIsNewContact(true);
    setModalFormObject(initialAddContactValues);
    setOpenModal(false);
  };

  const handleAddNewContact = (values, props) => {
      setContacts([...contacts, values]);
      props.resetForm();
      props.setSubmitting(false);
      handleCloseModal();
  };

  const handleUpdateContact = (values, props) => {
    const oldContacts = contacts.filter(({ id }) => id !== values.id);
    setContacts([...oldContacts, values]);
    props.resetForm();
    props.setSubmitting(false);
    handleCloseModal();
  };

  const handleOpenDeleteDialog = (contactId) => {
    setShouldBeDeleted(
      contacts.reduce((prevContact, currentContact) =>
        currentContact.id === contactId ? currentContact : prevContact
      )
    );
    setOpenDeleteDialog(true);
  };
  const handleCloseDeleteDialog = () => {
    setShouldBeDeleted(null);
    setOpenDeleteDialog(false);
  };

  const handleDeleteContact = () => {
    const newContacts = contacts.filter(({ id }) => id !== shouldBeDeleted.id);
    setContacts(newContacts);
    handleCloseDeleteDialog();
  };

  return (
    <TableContainer>
      <Button onClick={handleOpenModalAdd}>
        <Add /> Add Contact
      </Button>
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-label="modal-add-contact"
        aria-describedby="In this modal, contacts can be added or edited."
      >
        <Box sx={modalStyle}>
          <Typography
            id="modal-modal-title"
            variant="h4"
            component="h2"
            style={{ marginBottom: "2rem" }}
          >
            {isNewContact ? "Add Contact" : "Update Contact"}
          </Typography>
          <Formik
            initialValues={modalFormObject}
            enableReinitialize
            onSubmit={isNewContact ? handleAddNewContact : handleUpdateContact}
            validationSchema={validationSchema}
            validateOnChange={false}
            validateOnBlur={true}
          >
            {({ errors, touched, isSubmitting, isValid, values }) => (
              <Form noValidate>
                <Grid container spacing={4}>
                  <Grid item xs={12} md={6}>
                    <Field
                      as={TextField}
                      error={!!(errors.firstName && touched.firstName)}
                      fullWidth
                      helperText={
                        errors.firstName && touched.firstName
                          ? errors.firstName
                          : null
                      }
                      label="First Name"
                      aria-label="First Name"
                      name="firstName"
                      placeholder="Enter your first name"
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Field
                      as={TextField}
                      error={!!(errors.lastName && touched.lastName)}
                      fullWidth
                      helperText={
                        errors.lastName && touched.lastName
                          ? errors.lastName
                          : null
                      }
                      label="Last Name"
                      aria-label="Last Name"
                      name="lastName"
                      placeholder="Enter your last name"
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FieldArray
                      name="phoneNumbers"
                      render={({ remove, push }) => (
                        <Grid container spacing={4}>
                          {values.phoneNumbers.map((phoneNumber, index) => (
                            <Grid
                              container
                              item
                              spacing={4}
                              key={`new_number_${index}`}
                            >
                              <Grid item xs={6} md={4}>
                                <Field
                                  aria-label={`phoneNumbers-${index}-label`}
                                  as={Select}
                                  fullWidth
                                  name={`phoneNumbers.${index}.label`}
                                >
                                  {labelOptions.map((labelOption, index) => (
                                    <MenuItem value={labelOption.value} key={index}>
                                      {labelOption.label}
                                    </MenuItem>
                                  ))}
                                </Field>
                              </Grid>
                              <Grid
                                item
                                xs={12}
                                md={6}
                                order={{ xs: 3, md: 2 }}
                              >
                                <Field
                                  as={TextField}
                                  error={
                                    !!(
                                      errors.phoneNumbers?.[index]?.number &&
                                      touched.phoneNumbers?.[index]?.number
                                    )
                                  }
                                  fullWidth
                                  helperText={
                                    errors.phoneNumbers?.[index]?.number &&
                                    touched.phoneNumbers?.[index]?.number
                                      ? errors.phoneNumbers[index].number
                                      : null
                                  }
                                  aria-label="Phone Number"
                                  label="Phone Number"
                                  name={`phoneNumbers.${index}.number`}
                                  placeholder="Enter your phone number"
                                  required
                                />
                              </Grid>
                              <Grid
                                item
                                container
                                xs={6}
                                md={2}
                                order={{ xs: 2, md: 3 }}
                              >
                                <Button onClick={() => remove(index)}>
                                  <Delete />
                                </Button>
                              </Grid>
                            </Grid>
                          ))}
                          <Grid
                            item
                            xs={12}
                            display="flex"
                            justifyContent="flex-end"
                          >
                            <Button
                              color="secondary"
                              onClick={() =>
                                push({
                                  id: uuid(),
                                  label: "mobile",
                                  number: "",
                                })
                              }
                              type="button"
                              variant="contained"
                            >
                              <Add /> One more number
                            </Button>
                          </Grid>
                        </Grid>
                      )}
                    />
                  </Grid>
                  <Grid
                    container
                    item
                    xs={12}
                    display="flex"
                    justifyContent="flex-end"
                    spacing={4}
                  >
                    <Grid item>
                      <Button
                        color="primary"
                        onClick={handleCloseModal}
                        variant="outlined"
                      >
                        <Cancel />
                        <Typography variant="button" ml={1}>
                          Cancel
                        </Typography>
                      </Button>
                    </Grid>
                    <Grid item>
                      <Button
                        aria-label="submit-contact"
                        color="primary"
                        disabled={isSubmitting || !isValid}
                        type="submit"
                        variant="contained"
                      >
                        {isNewContact ? (
                          <>
                            <Add />{" "}
                            <Typography variant="button" ml={1}>
                              Add contact
                            </Typography>
                          </>
                        ) : (
                          <>
                            <Update />
                            <Typography variant="button" ml={1}>
                              Update contact
                            </Typography>
                          </>
                        )}
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
        </Box>
      </Modal>
      <Dialog
        open={openDeleteDialog}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleCloseDeleteDialog}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>Deletion confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            {`Do you really want to delete ${shouldBeDeleted?.firstName} ${shouldBeDeleted?.lastName}?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            onClick={handleCloseDeleteDialog}
            variant="outlined"
          >
            <Cancel />
            <Typography variant="button" ml={1}>
              Cancel
            </Typography>
          </Button>
          <Button
            color="error"
            onClick={handleDeleteContact}
            variant="contained"
          >
            <Delete />
            <Typography variant="button" ml={1}>
              Delete
            </Typography>
          </Button>
        </DialogActions>
      </Dialog>
      <Table sx={{ minWidth: 650 }} aria-label="Contact table">
        <TableHead>
          <TableRow>
            <TableCell>First Name</TableCell>
            <TableCell>Last Name</TableCell>
            <TableCell>Phone Number</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody aria-label="Contact table body">
          {contacts.length > 0 ? (
            contacts.map(
              ({ id: contactId, firstName, lastName, phoneNumbers }) => (
                <TableRow
                  aria-label={`${firstName} ${lastName}`}
                  key={"contact_" + contactId}
                  sx={{
                    "&:last-child td, &:last-child th": { border: 0 },
                    "&:nth-child(2n)": { backgroundColor: "#F5FCFF" },
                  }}
                >
                  <TableCell>{firstName}</TableCell>
                  <TableCell>{lastName}</TableCell>
                  <TableCell>
                    {phoneNumbers.map(
                      ({ id: phoneId, label, number }) => (
                        <Grid
                          container
                          key={
                            "contact_" + contactId + "phone_number" + phoneId
                          }
                          spacing={2}
                        >
                          <Grid item width={75}>
                            {labelOptions.reduce((prevLabel, currentLabel) => currentLabel.value === label ? currentLabel : prevLabel).label}
                          </Grid>
                          <Grid item>{number}</Grid>
                        </Grid>
                      )
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Button onClick={() => handleOpenModalUpdate(contactId)}>
                      <Edit />
                    </Button>
                    <Button onClick={() => handleOpenDeleteDialog(contactId)}>
                      <Delete />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            )
          ) : (
            <TableRow>
              <TableCell colSpan={4} style={{ textAlign: "center" }}>
                No contacts have been entered yet
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PhoneBook;
