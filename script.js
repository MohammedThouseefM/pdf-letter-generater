document.addEventListener('DOMContentLoaded', function() {
            // Get all DOM elements we need
            const letterType = document.getElementById('letterType');
            const senderName = document.getElementById('senderName');
            const senderAddress = document.getElementById('senderAddress');
            const senderAddressGroup = document.getElementById('senderAddressGroup');
            const recipientName = document.getElementById('recipientName');
            const recipientAddress = document.getElementById('recipientAddress');
            const recipientAddressGroup = document.getElementById('recipientAddressGroup');
            const subject = document.getElementById('subject');
            const subjectGroup = document.getElementById('subjectGroup');
            const bodyText = document.getElementById('bodyText');
            const letterPreview = document.getElementById('letterPreview');
            const generatePdfBtn = document.getElementById('generatePdf');

            // Initialize jsPDF
            const { jsPDF } = window.jspdf;

            // Toggle fields based on letter type
            letterType.addEventListener('change', function() {
                if (this.value === 'informal') {
                    subjectGroup.style.display = 'none';
                    senderAddressGroup.classList.add('hidden');
                    recipientAddressGroup.classList.add('hidden');
                } else {
                    subjectGroup.style.display = 'block';
                    senderAddressGroup.classList.remove('hidden');
                    recipientAddressGroup.classList.remove('hidden');
                }
                updatePreview();
            });

            // Update preview whenever any input changes
            [senderName, senderAddress, recipientName, recipientAddress, subject, bodyText].forEach(element => {
                element.addEventListener('input', updatePreview);
            });

            // Generate PDF when button is clicked
            generatePdfBtn.addEventListener('click', generatePdf);

            // Function to update the letter preview
            function updatePreview() {
                const type = letterType.value;
                const sender = senderName.value || 'Your Name';
                const senderAddr = senderAddress.value;
                const recipient = recipientName.value || 'Recipient Name';
                const recipientAddr = recipientAddress.value;
                const letterSubject = subject.value;
                const content = bodyText.value || 'Your letter content will appear here.';

                let previewHTML = '';

                if (type === 'formal') {
                    previewHTML = `
                        <div class="formal">
                            <div class="letter-header">
                                <div class="address">
                                    <div class="address-label">From:</div>
                                    <div>${sender}</div>
                                    ${senderAddr ? `<div>${senderAddr.replace(/\n/g, '<br>')}</div>` : ''}
                                </div>
                                
                                <div class="address" style="margin-top: 30px;">
                                    <div class="address-label">To:</div>
                                    <div>${recipient}</div>
                                    ${recipientAddr ? `<div>${recipientAddr.replace(/\n/g, '<br>')}</div>` : ''}
                                </div>
                                
                                <p style="margin-top: 20px;">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
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

                // Additional validation for formal letters
                if (letterType.value === 'formal' && (!senderAddress.value || !recipientAddress.value)) {
                    alert('For formal letters, both sender and recipient addresses are required.');
                    return;
                }

                const doc = new jsPDF();
                const type = letterType.value;
                const sender = senderName.value;
                const senderAddr = senderAddress.value;
                const recipient = recipientName.value;
                const recipientAddr = recipientAddress.value;
                const letterSubject = subject.value;
                const content = bodyText.value;
                const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

                // Set font based on letter type
                const font = type === 'formal' ? 'times' : 'helvetica';
                doc.setFont(font);

                // Add content to PDF
                let yPos = 20;

                if (type === 'formal') {
                    // Sender address
                    doc.text('From:', 20, yPos);
                    yPos += 7;
                    doc.text(sender, 20, yPos);
                    yPos += 7;
                    
                    // Split sender address into lines
                    const senderAddrLines = senderAddr.split('\n');
                    senderAddrLines.forEach(line => {
                        if (line.trim()) {
                            doc.text(line, 20, yPos);
                            yPos += 7;
                        }
                    });
                    
                    yPos += 10; // Extra space before recipient address
                    
                    // Recipient address
                    doc.text('To:', 20, yPos);
                    yPos += 7;
                    doc.text(recipient, 20, yPos);
                    yPos += 7;
                    
                    // Split recipient address into lines
                    const recipientAddrLines = recipientAddr.split('\n');
                    recipientAddrLines.forEach(line => {
                        if (line.trim()) {
                            doc.text(line, 20, yPos);
                            yPos += 7;
                        }
                    });
                    
                    yPos += 15; // Extra space before date
                }

                // Date
                doc.text(date, 20, yPos);
                yPos += 20;

                // Recipient salutation
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