/**
 * Notification Service for Teacher Application Workflow
 * Handles email notifications for application status changes
 */

import { UserProfile, ApplicationStatus } from '@/types/auth';

export interface INotificationService {
  sendTeacherApprovalNotification(user: UserProfile): Promise<void>;
  sendTeacherRejectionNotification(
    user: UserProfile,
    reason: string
  ): Promise<void>;
  sendAdminNewApplicationNotification(user: UserProfile): Promise<void>;
  sendTeacherApplicationSubmittedNotification(user: UserProfile): Promise<void>;
}

export class NotificationService implements INotificationService {
  /**
   * Send approval notification to teacher
   */
  async sendTeacherApprovalNotification(user: UserProfile): Promise<void> {
    try {
      const emailContent = this.generateApprovalEmail(user);

      // In a real implementation, this would integrate with an email service
      // like SendGrid, AWS SES, or Firebase Functions with email triggers
      console.log('Sending teacher approval email:', {
        to: user.email,
        subject: emailContent.subject,
        content: emailContent.html,
      });

      // TODO: Integrate with actual email service
      // await this.sendEmail({
      //   to: user.email,
      //   subject: emailContent.subject,
      //   html: emailContent.html
      // });
    } catch (error) {
      console.error('Failed to send teacher approval notification:', error);
      throw error;
    }
  }

  /**
   * Send rejection notification to teacher
   */
  async sendTeacherRejectionNotification(
    user: UserProfile,
    reason: string
  ): Promise<void> {
    try {
      const emailContent = this.generateRejectionEmail(user, reason);

      console.log('Sending teacher rejection email:', {
        to: user.email,
        subject: emailContent.subject,
        content: emailContent.html,
      });

      // TODO: Integrate with actual email service
      // await this.sendEmail({
      //   to: user.email,
      //   subject: emailContent.subject,
      //   html: emailContent.html
      // });
    } catch (error) {
      console.error('Failed to send teacher rejection notification:', error);
      throw error;
    }
  }

  /**
   * Send notification to admins about new teacher application
   */
  async sendAdminNewApplicationNotification(user: UserProfile): Promise<void> {
    try {
      const emailContent = this.generateNewApplicationEmail(user);

      // Get admin emails (in real implementation, fetch from database)
      const adminEmails =
        process.env.ADMIN_NOTIFICATION_EMAILS?.split(',') || [];

      for (const adminEmail of adminEmails) {
        console.log('Sending new application notification to admin:', {
          to: adminEmail,
          subject: emailContent.subject,
          content: emailContent.html,
        });

        // TODO: Integrate with actual email service
        // await this.sendEmail({
        //   to: adminEmail,
        //   subject: emailContent.subject,
        //   html: emailContent.html
        // });
      }
    } catch (error) {
      console.error('Failed to send admin notification:', error);
      throw error;
    }
  }

  /**
   * Send confirmation to teacher that application was submitted
   */
  async sendTeacherApplicationSubmittedNotification(
    user: UserProfile
  ): Promise<void> {
    try {
      const emailContent = this.generateApplicationSubmittedEmail(user);

      console.log('Sending application submitted confirmation:', {
        to: user.email,
        subject: emailContent.subject,
        content: emailContent.html,
      });

      // TODO: Integrate with actual email service
      // await this.sendEmail({
      //   to: user.email,
      //   subject: emailContent.subject,
      //   html: emailContent.html
      // });
    } catch (error) {
      console.error(
        'Failed to send application submitted notification:',
        error
      );
      throw error;
    }
  }

  /**
   * Generate approval email content
   */
  private generateApprovalEmail(user: UserProfile): {
    subject: string;
    html: string;
  } {
    const subject =
      'Congratulations! Your Teacher Application Has Been Approved';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Teacher Application Approved</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; margin: 10px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Application Approved!</h1>
          </div>
          <div class="content">
            <h2>Dear ${user.firstName} ${user.lastName},</h2>
            <p>We're excited to inform you that your teacher application has been <strong>approved</strong>!</p>
            
            <p>You can now access all teacher features on the Learnity platform, including:</p>
            <ul>
              <li>Creating and managing tutoring sessions</li>
              <li>Uploading educational content</li>
              <li>Viewing student progress</li>
              <li>Accessing the teacher dashboard</li>
            </ul>
            
            <p>Welcome to the Learnity teaching community!</p>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/teacher" class="button">
              Access Teacher Dashboard
            </a>
            
            <p>If you have any questions, please don't hesitate to contact our support team.</p>
            
            <p>Best regards,<br>The Learnity Team</p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return { subject, html };
  }

  /**
   * Generate rejection email content
   */
  private generateRejectionEmail(
    user: UserProfile,
    reason: string
  ): { subject: string; html: string } {
    const subject = 'Update on Your Teacher Application';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Teacher Application Update</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #FF9800; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 4px; margin: 10px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
          .reason-box { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 4px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Application Update</h1>
          </div>
          <div class="content">
            <h2>Dear ${user.firstName} ${user.lastName},</h2>
            <p>Thank you for your interest in becoming a teacher on the Learnity platform.</p>
            
            <p>After careful review, we are unable to approve your application at this time.</p>
            
            <div class="reason-box">
              <h3>Feedback:</h3>
              <p>${reason}</p>
            </div>
            
            <p>We encourage you to review the feedback and resubmit your application once you've addressed the concerns mentioned above.</p>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/application/update" class="button">
              Update Application
            </a>
            
            <p>If you have any questions about this decision or need clarification on the feedback, please contact our support team.</p>
            
            <p>Best regards,<br>The Learnity Team</p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return { subject, html };
  }

  /**
   * Generate new application notification for admins
   */
  private generateNewApplicationEmail(user: UserProfile): {
    subject: string;
    html: string;
  } {
    const subject = 'New Teacher Application Submitted - Review Required';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Teacher Application</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 4px; margin: 10px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
          .info-box { background-color: #e3f2fd; border: 1px solid #2196F3; padding: 15px; border-radius: 4px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 New Teacher Application</h1>
          </div>
          <div class="content">
            <h2>Admin Notification</h2>
            <p>A new teacher application has been submitted and requires your review.</p>
            
            <div class="info-box">
              <h3>Applicant Information:</h3>
              <p><strong>Name:</strong> ${user.firstName} ${user.lastName}</p>
              <p><strong>Email:</strong> ${user.email}</p>
              <p><strong>Submitted:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <p>Please review the application and make a decision on approval or rejection.</p>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/teachers" class="button">
              Review Application
            </a>
            
            <p>This notification was sent to all administrators.</p>
          </div>
          <div class="footer">
            <p>This is an automated message from the Learnity platform.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return { subject, html };
  }

  /**
   * Generate application submitted confirmation
   */
  private generateApplicationSubmittedEmail(user: UserProfile): {
    subject: string;
    html: string;
  } {
    const subject = 'Teacher Application Submitted Successfully';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Application Submitted</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 4px; margin: 10px 0; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Application Submitted</h1>
          </div>
          <div class="content">
            <h2>Dear ${user.firstName} ${user.lastName},</h2>
            <p>Thank you for submitting your teacher application to Learnity!</p>
            
            <p>Your application has been received and is now under review by our team. Here's what happens next:</p>
            
            <ol>
              <li><strong>Review Process:</strong> Our team will carefully review your qualifications and documents</li>
              <li><strong>Verification:</strong> We may contact you for additional information if needed</li>
              <li><strong>Decision:</strong> You'll receive an email notification with our decision</li>
            </ol>
            
            <p>The review process typically takes 3-5 business days.</p>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/application/status" class="button">
              Check Application Status
            </a>
            
            <p>If you need to update your application or have any questions, please contact our support team.</p>
            
            <p>Best regards,<br>The Learnity Team</p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return { subject, html };
  }

  /**
   * Send email using configured email service
   * TODO: Implement actual email service integration
   */
  private async sendEmail(emailData: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    // This would integrate with services like:
    // - SendGrid
    // - AWS SES
    // - Firebase Functions with email triggers
    // - Nodemailer with SMTP

    console.log('Email would be sent:', emailData);
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
