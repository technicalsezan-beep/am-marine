export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'

import nodemailer from 'nodemailer'

function getTransporter() {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT || 587)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) {
    throw new Error('SMTP credentials are not configured. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in your environment.')
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, ...formData } = body

    // Validate required fields
    if (!formData.name || !formData.email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    // Format email content based on inquiry type
    let emailSubject = ''
    let emailBody = ''

    if (type === 'product') {
      emailSubject = `Product Inquiry from ${formData.name}`
      emailBody = `
        <h2>New Product Inquiry</h2>
        <p><strong>From:</strong> ${formData.name}</p>
        <p><strong>Company:</strong> ${formData.company || 'N/A'}</p>
        <p><strong>Email:</strong> ${formData.email}</p>
        <p><strong>Phone:</strong> ${formData.phone || 'N/A'}</p>
        <p><strong>Vessel Type:</strong> ${formData.vesselType || 'N/A'}</p>
        <p><strong>Product Details:</strong></p>
        <p>${formData.productDetails?.replace(/\n/g, '<br>') || 'N/A'}</p>
      `
    } else if (type === 'service') {
      emailSubject = `Service Request from ${formData.name}`
      emailBody = `
        <h2>New Service Request</h2>
        <p><strong>From:</strong> ${formData.name}</p>
        <p><strong>Company:</strong> ${formData.company || 'N/A'}</p>
        <p><strong>Email:</strong> ${formData.email}</p>
        <p><strong>Phone:</strong> ${formData.phone || 'N/A'}</p>
        <p><strong>Vessel Name:</strong> ${formData.vesselName || 'N/A'}</p>
        <p><strong>Location:</strong> ${formData.location || 'N/A'}</p>
        <p><strong>Service Type:</strong> ${formData.serviceType || 'N/A'}</p>
        <p><strong>Service Details:</strong></p>
        <p>${formData.serviceDetails?.replace(/\n/g, '<br>') || 'N/A'}</p>
      `
    } else if (type === 'general') {
      emailSubject = `General Inquiry from ${formData.name}`
      emailBody = `
        <h2>New General Inquiry</h2>
        <p><strong>From:</strong> ${formData.name}</p>
        <p><strong>Email:</strong> ${formData.email}</p>
        <p><strong>Subject:</strong> ${formData.subject || 'N/A'}</p>
        <p><strong>Message:</strong></p>
        <p>${formData.message?.replace(/\n/g, '<br>') || 'N/A'}</p>
      `
    }

    // Prepare email
    const to = process.env.CONTACT_TO || 'nauticsinternational@gmail.com'
    const fromAddress = process.env.CONTACT_FROM || process.env.SMTP_USER || 'no-reply@nauticsinternational.com'

    console.log('Attempting to send email to:', to, 'from:', fromAddress)

    try {
      const transporter = getTransporter()
      
      const info = await transporter.sendMail({
        to,
        from: fromAddress,
        replyTo: formData.email,
        subject: emailSubject,
        html: emailBody,
      })
      
      console.log('Email sent successfully:', info.messageId)
    } catch (emailError) {
      console.error('Email sending failed:', emailError)
      return NextResponse.json(
        { 
          error: 'Failed to send email', 
          detail: (emailError as Error)?.message 
        },
        { status: 500 }
      )
    }

    // Return success response
    return NextResponse.json(
      { 
        success: true, 
        message: 'Your inquiry has been submitted successfully. We will get back to you soon!' 
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to submit inquiry. Please try again.', detail: (error as Error)?.message },
      { status: 500 }
    )
  }
}
