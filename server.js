// const express = require('express');
// const cors = require('cors');
// const mysql = require('mysql2/promise'); // Use promise version

// const app = express();

// // CORS Configuration
// app.use(cors({
//   origin: ['https://scojfood.com', 'http://localhost:3000'],
//   credentials: true
// }));

// app.use(express.json());

// // MySQL Database Configuration
// const dbConfig = {
//   host: process.env.DB_HOST,           // Hostinger external host
//   port: process.env.DB_PORT || 3306,   // Default MySQL port
//   user: process.env.DB_USER,           // Your database username
//   password: process.env.DB_PASSWORD,   // Your database password
//   database: process.env.DB_NAME,       // Your database name
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// };

// // Create MySQL connection pool
// let pool;

// async function initializePool() {
//   pool = mysql.createPool(dbConfig);
//   console.log('✅ MySQL connection pool created');
// }

// // Root endpoint
// app.get('/', (req, res) => {
//   res.json({
//     message: 'SCOJ Foods Backend API',
//     database: 'Hostinger MySQL',
//     status: pool ? 'connected' : 'disconnected'
//   });
// });

// // Health check endpoint
// app.get('/api/health', async (req, res) => {
//   try {
//     const connection = await pool.getConnection();
//     await connection.ping();
//     connection.release();
    
//     res.json({
//       status: 'OK',
//       service: 'SCOJ Foods API',
//       database: 'Connected',
//       uptime: process.uptime()
//     });
//   } catch (error) {
//     res.status(500).json({
//       status: 'ERROR',
//       service: 'SCOJ Foods API',
//       database: 'Disconnected',
//       error: error.message
//     });
//   }
// });

// // Store contact form submission
// app.post('/api/contact', async (req, res) => {
//   let connection;
//   try {
//     console.log('📩 Contact form submission received');
    
//     const { name, email, phone, subject, message } = req.body;
    
//     // Validate required fields
//     if (!name || !email || !phone || !subject || !message) {
//       return res.status(400).json({
//         success: false,
//         error: 'All fields are required'
//       });
//     }

//     // Get connection from pool
//     connection = await pool.getConnection();
    
//     const [result] = await connection.execute(
//       `INSERT INTO contact_submissions (name, email, phone, subject, message) 
//        VALUES (?, ?, ?, ?, ?)`,
//       [name.trim(), email.trim(), phone.trim(), subject.trim(), message.trim()]
//     );

//     console.log('✅ Contact form saved successfully, ID:', result.insertId);
    
//     res.status(201).json({ 
//       success: true, 
//       message: 'Contact form submitted successfully',
//       submissionId: result.insertId
//     });

//   } catch (error) {
//     console.error('❌ MySQL error:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to save contact information',
//       details: error.message
//     });
//   } finally {
//     if (connection) connection.release();
//   }
// });

// // Store brochure download request
// app.post('/api/brochure-download', async (req, res) => {
//   let connection;
//   try {
//     console.log('📥 Brochure download request received');
    
//     const { name, email, phone, company, inquiryType } = req.body;
    
//     // Validate required fields
//     if (!name || !email || !phone || !inquiryType) {
//       return res.status(400).json({
//         success: false,
//         error: 'Name, email, phone, and inquiry type are required'
//       });
//     }

//     // Get connection from pool
//     connection = await pool.getConnection();
    
//     // Check if email already exists
//     const [existing] = await connection.execute(
//       'SELECT id, download_count FROM brochure_downloads WHERE email = ?',
//       [email.trim()]
//     );

//     let result;
    
//     if (existing.length > 0) {
//       // Update existing record
//       const [updateResult] = await connection.execute(
//         'UPDATE brochure_downloads SET download_count = download_count + 1 WHERE id = ?',
//         [existing[0].id]
//       );
//       result = { insertId: existing[0].id, downloadCount: existing[0].download_count + 1 };
//       console.log('✅ Updated existing download count');
//     } else {
//       // Insert new record
//       const [insertResult] = await connection.execute(
//         `INSERT INTO brochure_downloads (name, email, phone, company, inquiry_type) 
//          VALUES (?, ?, ?, ?, ?)`,
//         [name.trim(), email.trim(), phone.trim(), company ? company.trim() : null, inquiryType]
//       );
//       result = { insertId: insertResult.insertId, downloadCount: 1 };
//       console.log('✅ New download record created');
//     }

//     res.status(201).json({ 
//       success: true, 
//       message: 'Download recorded successfully',
//       downloadUrl: 'https://yourdomain.com/documents/Scoj Food Brocher.pdf',
//       recordId: result.insertId,
//       downloadCount: result.downloadCount
//     });

//   } catch (error) {
//     console.error('❌ MySQL error:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to process download request',
//       details: error.message
//     });
//   } finally {
//     if (connection) connection.release();
//   }
// });

// // 404 handler
// app.use((req, res) => {
//   res.status(404).json({
//     success: false,
//     error: 'Endpoint not found'
//   });
// });

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error('Unhandled error:', err);
//   res.status(500).json({
//     success: false,
//     error: 'Internal server error'
//   });
// });

// // Get port from environment or default
// const PORT = process.env.PORT || 3001;

// // Initialize and start server
// initializePool().then(() => {
//   app.listen(PORT, () => {
//     console.log(`🚀 Server running on port ${PORT}`);
//     console.log(`📊 Database: Hostinger MySQL`);
//     console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
//   });
// }).catch(error => {
//   console.error('Failed to initialize database:', error);
//   process.exit(1);
// });

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();

/* =========================
   Middleware
========================= */

app.use(cors({
  origin: ['https://scojfood.com', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());

/* =========================
   MySQL Configuration
========================= */

const dbConfig = {
  host: process.env.DB_HOST,          // mysql.hostinger.in
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool = null;

/* =========================
   Initialize DB Pool (SAFE)
========================= */

function initializePool() {
  try {
    pool = mysql.createPool(dbConfig);
    console.log('✅ MySQL pool initialized');
  } catch (err) {
    console.error('❌ Failed to initialize MySQL pool:', err.message);
  }
}

/* =========================
   Helper: Get DB Connection
========================= */

async function getDbConnection() {
  if (!pool) {
    throw new Error('Database pool not initialized');
  }
  return pool.getConnection();
}

/* =========================
   Routes
========================= */

// Root
app.get('/', (req, res) => {
  res.json({
    message: 'SCOJ Foods Backend API',
    status: 'running'
  });
});

// ✅ Health Check (NO DB dependency)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'SCOJ Foods API',
    uptime: process.uptime()
  });
});

// Contact Form
app.post('/api/contact', async (req, res) => {
  let connection;

  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !phone || !subject || !message) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }

    connection = await getDbConnection();

    const [result] = await connection.execute(
      `INSERT INTO contact_submissions 
       (name, email, phone, subject, message)
       VALUES (?, ?, ?, ?, ?)`,
      [
        name.trim(),
        email.trim(),
        phone.trim(),
        subject.trim(),
        message.trim()
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Contact form submitted successfully',
      submissionId: result.insertId
    });

  } catch (error) {
    console.error('❌ Contact API error:', error.message);

    res.status(500).json({
      success: false,
      error: 'Failed to save contact information'
    });
  } finally {
    if (connection) connection.release();
  }
});

// Brochure Download
app.post('/api/brochure-download', async (req, res) => {
  let connection;

  try {
    const { name, email, phone, company, inquiryType } = req.body;

    if (!name || !email || !phone || !inquiryType) {
      return res.status(400).json({
        success: false,
        error: 'Required fields missing'
      });
    }

    connection = await getDbConnection();

    const [existing] = await connection.execute(
      'SELECT id, download_count FROM brochure_downloads WHERE email = ?',
      [email.trim()]
    );

    let recordId;
    let downloadCount;

    if (existing.length > 0) {
      await connection.execute(
        'UPDATE brochure_downloads SET download_count = download_count + 1 WHERE id = ?',
        [existing[0].id]
      );

      recordId = existing[0].id;
      downloadCount = existing[0].download_count + 1;
    } else {
      const [insertResult] = await connection.execute(
        `INSERT INTO brochure_downloads
         (name, email, phone, company, inquiry_type)
         VALUES (?, ?, ?, ?, ?)`,
        [
          name.trim(),
          email.trim(),
          phone.trim(),
          company ? company.trim() : null,
          inquiryType
        ]
      );

      recordId = insertResult.insertId;
      downloadCount = 1;
    }

    res.status(201).json({
      success: true,
      message: 'Download recorded successfully',
      recordId,
      downloadCount,
      downloadUrl: 'https://scojfood.com/documents/Scoj Food Brocher.pdf'
    });

  } catch (error) {
    console.error('❌ Brochure API error:', error.message);

    res.status(500).json({
      success: false,
      error: 'Failed to process download request'
    });
  } finally {
    if (connection) connection.release();
  }
});

/* =========================
   404 Handler
========================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

/* =========================
   Global Error Handler
========================= */

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

/* =========================
   Start Server
========================= */

const PORT = process.env.PORT || 3001;

// Initialize DB (non-blocking)
initializePool();

// Start server regardless of DB state
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
