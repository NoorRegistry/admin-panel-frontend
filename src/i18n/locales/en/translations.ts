const translations = {
  login: {
    loginToAccount: "Login to Your Account",
    orLoginWith: "Or login with",
    login: "Login",
    confirmationCode: "Verification code",
    emailSentTo:
      "Enter the verification code we sent to <Important>{{email}}</Important>",
    didNotGetCode: "Didn’t receive the code?",
    resend: "Resend",
    loginSuccessfull: "Logged in successfully",
    resendCodeSuccessfull: "Verification code sent successfully",
    loginAgreement:
      "By signing up, you agree to our <a>Terms</a>, <1>Data Policy</1> and <2>Cookies Policy</2>.",
    enterValidEmail: "Enter valid email",
    enterEmail: "Enter email",
    password: "Password",
    enterPassword: "Password is required",
  },
  stores: {
    stores: "Stores",
    createStore: "Create Store",
    editStore: "Edit Store",
    name: "Name",
    contact: "Contact",
    email: "Email",
    description: "Description",
    location: "Location",
    locationEn: "Location EN",
    locationAr: "Location AR",
    storeCreated: "Store {{name}} created succesfully",
    nameEn: "Name EN",
    nameAr: "Name AR",
    descriptionEn: "Description EN",
    descriptionAr: "Description AR",
  },
  common: {
    login: "Log in",
    home: "Home",
    dashboard: "Dashboard",
    logout: "Log out",
    back: "Back",
    cancel: "Cancel",
    skip: "Skip",
    submit: "Submit",
    email: "Email",
    next: "Next",
    buySeries: "See more",
    required: "Required",
  },
} as const;

export default translations;
