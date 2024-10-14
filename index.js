const express = require('express');
const samlify = require('samlify');
const fs = require('fs');
const validator = require("@authenio/samlify-xsd-schema-validator")

const app = express();

app.use(express.urlencoded({ extended: false }));

samlify.setSchemaValidator(validator);

const idp = samlify.IdentityProvider({
    metadata: fs.readFileSync("./metadata/idp-metadata.xml"),
    signingCert: fs.readFileSync("./certificates/idp-certificate.pem"),
})

const sp = samlify.ServiceProvider({
    entityID: "_b21915a8-8442-4054-ba8c-b116cbfae967",
    wantAssertionsSigned: true,
    assertionConsumerService: [{
        Binding: samlify.Constants.namespace.binding.post,
        Location: "http://localhost:3000/acs",
    }],
})

app.get("/metadata",(req, res) => {
    res.header("Content-Type", "text/xml").send(sp.getMetadata());
})

app.get("/login", (req, res) => {
    const {context} = sp.createLoginRequest(idp)
    return res.redirect(context)
})

app.post("/acs", (req, res) => {
    console.log(req.body.SAMLResponse) // the token here is valid

    sp.parseLoginResponse(idp, "post", req).then(result => {
        console.log(result)
    }).catch(err => console.log(err)) // this thing throws an error!!!!!!!!!!!!!!!!!

    res.redirect("/")

})

app.listen(3000, () => {
    console.log("App launched.")
});
