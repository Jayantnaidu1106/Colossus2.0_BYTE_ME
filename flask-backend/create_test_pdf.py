from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph

def create_test_pdf(output_path, text_path):
    # Read the text content
    with open(text_path, 'r') as file:
        content = file.read()
    
    # Create a PDF document
    doc = SimpleDocTemplate(output_path, pagesize=letter)
    styles = getSampleStyleSheet()
    
    # Split the content into paragraphs
    paragraphs = content.split('\n\n')
    
    # Convert paragraphs to Paragraph objects
    elements = []
    for para in paragraphs:
        if para.strip():
            elements.append(Paragraph(para, styles['Normal']))
    
    # Build the PDF
    doc.build(elements)
    
    print(f"PDF created at {output_path}")

if __name__ == "__main__":
    create_test_pdf("test_document.pdf", "test_pdf_content.txt")
