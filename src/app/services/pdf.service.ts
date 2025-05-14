import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  gerarPdfCardapio(cardapio: any): void {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text(cardapio.nome, 15, 15);
    
    doc.setFontSize(12);
    const lines = doc.splitTextToSize(cardapio.conteudo, 180);
    doc.text(lines, 15, 30);
    
    doc.save(`cardapio_${new Date().toISOString().slice(0,10)}.pdf`);
  }
}