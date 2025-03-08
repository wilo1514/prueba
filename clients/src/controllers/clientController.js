const Client = require('../models/client');

exports.createClient = async (req, res) => {
    try {
        const client = new Client(req.body);
        await client.save();
        res.status(201).json(client);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getClients = async (req, res) => {
    try {
        const clients = await Client.find();
        res.status(200).json(clients);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getClient = async (req, res) => {
    try {
        const client = await Client.findById(req.params.id);
        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }
        res.status(200).json(client);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateClient = async (req, res) => {
    try {
        const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }
        res.status(200).json(client);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updateClientByIdentification = async (req, res) => {
    try {
        const client = await Client.findOneAndUpdate({ identificacion: req.params.identificacion }, req.body, { new: true });
        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }
        res.status(200).json(client);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deleteClient = async (req, res) => {
    try {
        const client = await Client.findByIdAndDelete(req.params.id);
        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }
        res.status(200).json({ message: 'Client deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getClientByRazonSocial = async (req, res) => {
    try {
        const clients = await Client.find({ razonSocial: req.params.razonSocial });
        if (clients.length === 0) {
            return res.status(404).json({ error: 'No clients found with the provided razonSocial' });
        }
        res.status(200).json(clients);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Buscar clientes por identificación
exports.getClientByIdentificacion = async (req, res) => {
    try {
        const client = await Client.findOne({ identificacion: req.params.identificacion });
        if (!client) {
            return res.status(404).json({ error: 'Client not found with the provided identificacion' });
        }
        res.status(200).json(client);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};