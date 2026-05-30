const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const axios = require('axios');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Configurar transporter de email (usar seu próprio SMTP ou serviço)
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER || 'seu-email@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'sua-senha-app'
    }
});

// Rota para servir o HTML principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API para processar contatos
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;

        // Validação básica
        if (!name || !email || !phone || !message) {
            return res.status(400).json({ 
                error: 'Todos os campos são obrigatórios' 
            });
        }

        // Enviar email para a empresa
        const emailContent = `
            <h2>Novo Contato da BASE4 Custom Fitness</h2>
            <p><strong>Nome:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>WhatsApp:</strong> ${phone}</p>
            <p><strong>Mensagem:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
            <hr>
            <p><em>Mensagem recebida em: ${new Date().toLocaleString('pt-BR')}</em></p>
        `;

        // Enviar email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.BUSINESS_EMAIL || 'contato@base4fitness.com',
            subject: `Novo Contato: ${name}`,
            html: emailContent,
            replyTo: email
        });

        // Log do contato
        console.log(`✓ Novo contato recebido: ${name} (${email})`);

        res.json({ 
            success: true, 
            message: 'Mensagem enviada com sucesso!' 
        });

    } catch (error) {
        console.error('Erro ao processar contato:', error);
        res.status(500).json({ 
            error: 'Erro ao processar sua solicitação. Tente novamente.' 
        });
    }
});

// API para iniciar conversa WhatsApp
app.post('/api/whatsapp', async (req, res) => {
    try {
        const { phone, message } = req.body;

        if (!phone || !message) {
            return res.status(400).json({ 
                error: 'Telefone e mensagem são obrigatórios' 
            });
        }

        // Formatar número para WhatsApp (remover formatação e adicionar código país)
        const cleanPhone = phone.replace(/\D/g, '');
        const whatsappLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

        res.json({ 
            success: true, 
            whatsappLink: whatsappLink
        });

    } catch (error) {
        console.error('Erro ao processar WhatsApp:', error);
        res.status(500).json({ 
            error: 'Erro ao processar solicitação' 
        });
    }
});

// API para informações dos serviços
app.get('/api/services', (req, res) => {
    const services = [
        {
            id: 1,
            name: 'Estamparia DTF',
            description: 'Impressão digital direta em tecido com qualidade profissional',
            icon: '🖨️',
            details: 'Cores vibrantes e durabilidade garantida'
        },
        {
            id: 2,
            name: 'Filme Termocolante',
            description: 'Aplicação de filme de recorte eletrônico com elastano',
            icon: '✨',
            details: 'Acabamento premium e conforto garantido'
        },
        {
            id: 3,
            name: 'Silk Personalizado',
            description: 'Tecnologia silk com elastano para designs sofisticados',
            icon: '🎨',
            details: 'Perfeito para criar peças únicas'
        }
    ];
    res.json(services);
});

// API para informações dos produtos
app.get('/api/products', (req, res) => {
    const products = [
        {
            id: 1,
            name: 'Camiseta Básica',
            description: 'Camiseta premium para personalização',
            materials: ['Algodão', 'Dry Fit', 'Tech Modal'],
            image: 'tshirt'
        },
        {
            id: 2,
            name: 'Babylook',
            description: 'Camiseta ajustada e feminina',
            materials: ['Algodão', 'Dry Fit'],
            image: 'babylook'
        },
        {
            id: 3,
            name: 'Shorts',
            description: 'Short confortável para treino',
            materials: ['Poliamida Premium'],
            image: 'shorts'
        },
        {
            id: 4,
            name: 'Top',
            description: 'Top esportivo com suporte',
            materials: ['Poliamida Premium'],
            image: 'top'
        },
        {
            id: 5,
            name: 'Leggings',
            description: 'Leggings confortável e elegante',
            materials: ['Poliamida Premium'],
            image: 'leggings'
        },
        {
            id: 6,
            name: 'Acessórios',
            description: 'Personalize seus acessórios',
            materials: ['Variados'],
            image: 'accessories'
        }
    ];
    res.json(products);
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        service: 'BASE4 Custom Fitness API',
        timestamp: new Date().toISOString()
    });
});

// Tratamento de erros 404
app.use((req, res) => {
    res.status(404).json({ error: 'Rota não encontrada' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║        BASE4 CUSTOM FITNESS - Servidor Ativo              ║
║                                                            ║
║        Acesse: http://localhost:${PORT}                   ║
║        API Health: http://localhost:${PORT}/api/health    ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
    `);
});

module.exports = app;
