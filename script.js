// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
    // Get all DOM elements we need
    const letterType = document.getElementById('letterType');
    const senderName = document.getElementById('senderName');
    const recipientName = document.getElementById('recipientName');
    const subject = document.getElementById('subject');
    const subjectGroup = document.getElementById('subjectGroup');
    const bodyText = document.getElementById('bodyText');
    const letterPreview = document.getElementById('letterPreview');
    const generatePdfBtn = document.getElementById('generatePdf');

    // Initialize jsPDF
    const { jsPDF } = window.jspdf;

    // Toggle subject field based on letter type
    letterType.addEventListener('change', function () {
        if (this.value === 'informal') {
            subjectGroup.style.display = 'none';
        } else {
            subjectGroup.style.display = 'block';
        }
        updatePreview();
    });

    // Update preview whenever any input changes
    [senderName, recipientName, subject, bodyText].forEach(element => {
        element.addEventListener('input', updatePreview);
    });

    // Generate PDF when button is clicked
    generatePdfBtn.addEventListener('click', generatePdf);

    // Function to update the letter preview
    function updatePreview() {
        const type = letterType.value;
        const sender = senderName.value || 'Your Name';
        const recipient = recipientName.value || 'Recipient Name';
        const letterSubject = subject.value;
        const content = bodyText.value || 'Your letter content will appear here.';

        let previewHTML = '';

        if (type === 'formal') {
            previewHTML = `
                        <div class="formal">
                            <div class="letter-header">
                                <p>${sender}</p>
                                <p>${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                            
                            <p>Dear ${recipient},</p>
                            
                            ${letterSubject ? `<div class="subject-line">Subject: ${letterSubject}</div>` : ''}
                            
                            <div class="letter-body">${content.replace(/\n/g, '<br>')}</div>
                            
                            <div class="letter-footer">
                                <p>Yours sincerely,</p>
                                <div class="signature">${sender}</div>
                            </div>
                        </div>
                    `;
        } else if (type === 'informal') {
            previewHTML = `
                        <div class="informal">
                            <div class="letter-header">
                                <p>${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                            
                            <p>Dear ${recipient},</p>
                            
                            <div class="letter-body">${content.replace(/\n/g, '<br>')}</div>
                            
                            <div class="letter-footer">
                                <p>Best wishes,</p>
                                <div class="signature">${sender}</div>
                            </div>
                        </div>
                    `;
        } else {
            previewHTML = '<p>Your letter will appear here as you type...</p>';
        }

        letterPreview.innerHTML = previewHTML;
    }

    // Function to generate PDF
    function generatePdf() {
        // Validate form
        if (!letterType.value || !senderName.value || !recipientName.value || !bodyText.value) {
            alert('Please fill in all required fields.');
            return;
        }

        const doc = new jsPDF();
        const type = letterType.value;
        const sender = senderName.value;
        const recipient = recipientName.value;
        const letterSubject = subject.value;
        const content = bodyText.value;
        const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

        // Set font based on letter type
        const font = type === 'formal' ? 'times' : 'helvetica';
        doc.setFont(font);

        // Add content to PDF
        let yPos = 20;

        // Sender info and date
        doc.text(sender, 20, yPos);
        yPos += 10;
        doc.text(date, 20, yPos);
        yPos += 20;

        // Recipient
        doc.text(`Dear ${recipient},`, 20, yPos);
        yPos += 10;

        // Subject (for formal letters)
        if (type === 'formal' && letterSubject) {
            doc.setFont(font, 'bold');
            doc.text(`Subject: ${letterSubject}`, 20, yPos);
            doc.setFont(font, 'normal');
            yPos += 10;
        }

        // Letter body
        const splitText = doc.splitTextToSize(content, 170);
        doc.text(splitText, 20, yPos);
        yPos += splitText.length * 7 + 20;

        // Closing
        doc.text(type === 'formal' ? 'Yours sincerely,' : 'Best wishes,', 20, yPos);
        yPos += 10;
        doc.text(sender, 20, yPos);

        // Save the PDF
        doc.save(`${type}-letter-${new Date().toISOString().slice(0, 10)}.pdf`);
    }
});
