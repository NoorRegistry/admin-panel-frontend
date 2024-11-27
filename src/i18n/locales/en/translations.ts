const translations = {
  login: {
    loginToAccount: 'Login to Your Account',
    orLoginWith: 'Or login with',
    login: 'Login',
    confirmationCode: 'Verification code',
    emailSentTo:
      'Enter the verification code we sent to <Important>{{email}}</Important>',
    didNotGetCode: 'Didn’t receive the code?',
    resend: 'Resend',
    loginSuccessfull: 'Logged in successfully',
    resendCodeSuccessfull: 'Verification code sent successfully',
    loginAgreement:
      'By signing up, you agree to our <a>Terms</a>, <1>Data Policy</1> and <2>Cookies Policy</2>.',
  },
  registerOldPurchase: {
    registerOldPurchase: 'Register promo code',
    description: 'Enter promo code email and number',
    orderId: 'Number',
    success: 'Promo code registered successfully',
    submit: 'Activate'
  },
  story: {
    playAudio: 'Play Audio',
    readBook: 'Read',
    printBook: 'Print',
  },
  settings: {
    title: 'Settings',
  },
  common: {
    login: 'Log in',
    home: 'Home',
    library: 'Library',
    logout: 'Log out',
    back: 'Back',
    cancel: 'Cancel',
    skip: 'Skip',
    submit: 'Submit',
    email: 'Email',
    next: 'Next',
    buySeries: 'See more',
  },
  onboard: {
    title1: 'Discover Open Tales.',
    description1: 'Therapeutic audio stories that help your child cope with difficult emotions.',
    title2: 'It\'s not just interesting stories.',
    description2: 'The stories have a therapeutic effect, regulating strong emotions and developing psychological skills.',
    title3: 'Discover the power of stories.',
    description3: 'Each story develops your child\'s imagination and encourages conversation and reflection.',
    letsStart: "Let's Get Started",
  },
  library: {
    all: 'All',
  },
} as const;

export default translations;
