const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// Enable CORS for all origins (you can restrict later)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'SCOJ Foods Backend API',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'SCOJ Foods API',
    uptime: process.uptime()
  });
});

// Store contact form submission
app.post('/api/contact', async (req, res) => {
  try {
    console.log('📩 Contact form submission received');
    
    const { name, email, phone, subject, message } = req.body;
    
    // Validate required fields
    if (!name || !email || !phone || !subject || !message) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }

    // Initialize Supabase client
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({
        success: false,
        error: 'Server configuration error'
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('contact_submissions')
      .insert([{
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        subject: subject.trim(),
        message: message.trim()
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to save contact information'
      });
    }

    console.log('✅ Contact form saved successfully');
    
    res.status(201).json({ 
      success: true, 
      message: 'Contact form submitted successfully',
      submissionId: data.id
    });

  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Store brochure download request
app.post('/api/brochure-download', async (req, res) => {
  try {
    console.log('📥 Brochure download request received');
    
    const { name, email, phone, company, inquiryType } = req.body;
    
    // Validate required fields
    if (!name || !email || !phone || !inquiryType) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, phone, and inquiry type are required'
      });
    }

    // Initialize Supabase client
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({
        success: false,
        error: 'Server configuration error'
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('brochure_downloads')
      .insert([{
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        company: company ? company.trim() : null,
        inquiry_type: inquiryType
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to save download request'
      });
    }

    console.log('✅ Brochure download recorded');
    
    res.status(201).json({ 
      success: true, 
      message: 'Download recorded successfully',
      downloadUrl: 'https://yourdomain.com/documents/Scoj Food Brocher.pdf',
      recordId: data.id
    });

  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process download request'
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Get port from environment or default
const PORT = process.env.PORT || 3001;

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
});