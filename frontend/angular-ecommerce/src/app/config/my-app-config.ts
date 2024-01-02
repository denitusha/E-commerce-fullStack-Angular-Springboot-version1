export default {

    oidc: {
        clientId: '0oadq6d4ypy2cVebg5d7',
        issuer: 'https://dev-15150470.okta.com/oauth2/default',
        redirectUri: 'https://localhost:4200/login/callback',
        scopes: ['openid', 'profile', 'email'],
        features: { registration: true }
    }

}
