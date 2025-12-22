const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();

// CORS Configuration - UPDATE WITH YOUR FRONTEND URL
const allowedOrigins = [
  'https://yourdomain.com', // Your Hostinger domain
  'http://localhost:3000',   // Local development
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'SCOJ Foods Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      contact: '/api/contact (POST)',
      brochure: '/api/brochure-download (POST)'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'SCOJ Foods API',
    uptime: process.uptime()
  });
});

// Store contact form submission
app.post('/api/contact', async (req, res) => {
  try {
    console.log('Contact form submission received');
    
    const { name, email, phone, subject, message } = req.body;
    
    // Validate required fields
    if (!name || !email || !phone || !subject || !message) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }

    // Basic validation
    if (name.length < 2 || name.length > 100) {
      return res.status(400).json({
        success: false,
        error: 'Name must be between 2 and 100 characters'
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address'
      });
    }

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
      console.error('Supabase error:', error);
      return res.status(500).json({
        success: false,
        error: 'Database error: Failed to save contact information'
      });
    }

    console.log('Contact form saved successfully:', data.id);
    
    res.status(201).json({ 
      success: true, 
      message: 'Contact form submitted successfully',
      submissionId: data.id
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Store brochure download request
app.post('/api/brochure-download', async (req, res) => {
  try {
    console.log('Brochure download request received');
    
    const { name, email, phone, company, inquiryType } = req.body;
    
    // Validate required fields
    if (!name || !email || !phone || !inquiryType) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, phone, and inquiry type are required'
      });
    }

    // Basic validation
    if (name.length < 2 || name.length > 100) {
      return res.status(400).json({
        success: false,
        error: 'Name must be between 2 and 100 characters'
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address'
      });
    }

    // Check if user already downloaded before
    const { data: existingDownload, error: fetchError } = await supabase
      .from('brochure_downloads')
      .select('*')
      .eq('email', email.trim())
      .maybeSingle();

    if (fetchError) {
      console.error('Fetch error:', fetchError);
    }

    let result;
    
    if (existingDownload) {
      // Update download count for existing user
      const { data, error } = await supabase
        .from('brochure_downloads')
        .update({
          download_count: existingDownload.download_count + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingDownload.id)
        .select()
        .single();

      if (error) {
        console.error('Update error:', error);
        throw error;
      }
      result = data;
      console.log('Updated existing download count:', data.id);
    } else {
      // Insert new download record
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
        console.error('Insert error:', error);
        throw error;
      }
      result = data;
      console.log('Created new download record:', data.id);
    }

    res.status(201).json({ 
      success: true, 
      message: 'Download recorded successfully',
      downloadUrl: 'https://yourdomain.com/documents/Scoj Food Brocher.pdf', // UPDATE THIS
      recordId: result.id,
      downloadCount: result.download_count || 1
    });

  } catch (error) {
    console.error('Server error:', error);
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!'
  });
});

// Get port from environment or default
const PORT = process.env.PORT || 3001;

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 API Base URL: http://localhost:${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
});