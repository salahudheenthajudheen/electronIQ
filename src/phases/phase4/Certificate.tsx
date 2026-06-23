import { Button } from '@/components/ui/button'
import { Download, Share2 } from 'lucide-react'

interface CertificateProps {
  studentName: string
  schoolName: string
}

export function Certificate({ studentName, schoolName }: CertificateProps) {
  const generatePDF = async () => {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF('landscape', 'mm', 'a4')
    
    // Border
    doc.setDrawColor(108, 99, 255)
    doc.setLineWidth(2)
    doc.rect(10, 10, 277, 190)
    
    // Inner border
    doc.setDrawColor(0, 212, 170)
    doc.setLineWidth(1)
    doc.rect(15, 15, 267, 180)
    
    // Title
    doc.setFontSize(36)
    doc.setTextColor(108, 99, 255)
    doc.text('Certificate of Completion', 148.5, 50, { align: 'center' })
    
    // Subtitle
    doc.setFontSize(16)
    doc.setTextColor(148, 163, 184)
    doc.text('ElectronIQ — Module 1: Discovery of Electron', 148.5, 65, { align: 'center' })
    
    // Body
    doc.setFontSize(14)
    doc.setTextColor(241, 245, 249)
    doc.text('This is to certify that', 148.5, 90, { align: 'center' })
    
    doc.setFontSize(28)
    doc.setTextColor(0, 212, 170)
    doc.text(studentName, 148.5, 110, { align: 'center' })
    
    doc.setFontSize(14)
    doc.setTextColor(241, 245, 249)
    doc.text(`has successfully completed all phases of the ElectronIQ`, 148.5, 130, { align: 'center' })
    doc.text(`learning module on the discovery of the electron.`, 148.5, 142, { align: 'center' })
    
    doc.setFontSize(12)
    doc.setTextColor(148, 163, 184)
    doc.text(`${schoolName} — ${new Date().toLocaleDateString()}`, 148.5, 165, { align: 'center' })
    
    doc.save('ElectronIQ-Certificate.pdf')
  }

  return (
    <div className="flex gap-4 justify-center">
      <Button onClick={generatePDF}>
        <Download className="w-4 h-4 mr-2" />
        Download Certificate
      </Button>
      <Button variant="outline" onClick={generatePDF}>
        <Share2 className="w-4 h-4 mr-2" />
        Share
      </Button>
    </div>
  )
}
