const fs = require('fs');
const forge = require('node-forge');
const { SignedXml } = require('xml-crypto');

function firmarXML(xml, p12Path, p12Password) {
    try {
        // Leer el archivo .p12
        const p12Buffer = fs.readFileSync(p12Path);
        const p12Asn1 = forge.asn1.fromDer(p12Buffer.toString('binary'));
        const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, p12Password);

        // Intentar obtener la clave privada desde un 'pkcs8ShroudedKeyBag' o 'keyBag'
        const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag }).bags;
        let privateKey;
        if (keyBags && keyBags.length > 0) {
            privateKey = forge.pki.privateKeyToPem(keyBags[0].key);
        } else {
            // Intentar con keyBag en caso de que pkcs8ShroudedKeyBag no funcione
            const keyBag = p12.getBags({ bagType: forge.pki.oids.keyBag }).bags;
            if (keyBag && keyBag.length > 0) {
                privateKey = forge.pki.privateKeyToPem(keyBag[0].key);
            } else {
                throw new Error('No se pudo encontrar la clave privada en el archivo .p12');
            }
        }

        // Obtener el certificado
        const certBags = p12.getBags({ bagType: forge.pki.oids.certBag }).bags;
        if (!certBags || certBags.length === 0) {
            throw new Error('No se pudo encontrar el certificado en el archivo .p12');
        }
        const cert = forge.pki.certificateToPem(certBags[0].cert);

        // Firmar el XML
        const sig = new SignedXml();
        sig.addReference("//*[local-name(.)='factura']");
        sig.signingKey = privateKey;
        sig.keyInfoProvider = {
            getKeyInfo: () => `<X509Data><X509Certificate>${cert}</X509Certificate></X509Data>`
        };

        sig.computeSignature(xml);

        return sig.getSignedXml();
    } catch (error) {
        console.error('Error al firmar el XML:', error.message);
        throw error;  // Asegurarse de propagar el error correctamente
    }
}

module.exports = firmarXML;
