import { Component, OnInit } from '@angular/core';
import { FaqService } from '../../../core/services/faq.service';
import { Faq } from '../../../core/models/faq.interface';
import {  FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Validators } from '@angular/forms';
import { alertMethod } from '../alerts/alert-function/alerts.functions';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-faq-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './faq-list.component.html',
  styleUrl: './faq-list.component.css'
})
export class FaqListComponent implements OnInit {
  faqs: Faq[] = []; 
  faqForm : FormGroup = new FormGroup({});
  selectedFaq: Faq | null = null; 

  constructor(private faqService: FaqService,
    private fb: FormBuilder
  ) {
    this.faqForm = this.fb.group({
      pregunta: ['', Validators.required],
      respuesta: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.faqService.findAllFaqs().subscribe((faq: Faq[]) => {
      this.faqs = faq
    });
  
  }
  
  addFaq(): void {
    try {
      if(this.faqForm.valid){
        const faqData = this.faqForm.value;
        this.faqService.addFaq(faqData).subscribe(() => {
          this.closeModal('addFaq');
          alertMethod('Alta de faq', 'Faq creada correctamente', 'success');
          this.faqForm.reset();
          this.ngOnInit();
        })
      }
    } catch (error) {
      alertMethod('Alta de Faq', 'Error al crear la Faq', 'error');
      this.faqForm.reset();
      this.closeModal('addFaq'); 
    }
  }

  editFaq(): void {
    try {
      if(this.selectedFaq){
        const updatedFaq = {
          ...this.selectedFaq,
          ...this.faqForm.value

        }
          this.faqService.updateFaq(updatedFaq).subscribe(() => {
          this.closeModal('editFaq');
          alertMethod('Editar FAQ', 'Faq editada correctamente', 'success');
          this.faqForm.reset();
          this.ngOnInit();
        });
      }else{
        this.closeModal('editFaq');
        alertMethod('Editar FAQ', 'Error al editar la Faq', 'error');
        this.faqForm.reset();
      }
    } catch (error) {
      this.closeModal('editFaq');
      alertMethod('Editar FAQ', 'Error al editar la Faq', 'error');
      this.faqForm.reset();

    }

  }

  deleteFaq(faq: Faq, modalId: string): void {
    try {
      if(faq){
        this.faqService.deleteFaq(faq.id).subscribe(() => {
          this.closeModal(modalId);
          alertMethod('Eliminar FAQ', 'Faq eliminada correctamente', 'success');
          this.faqForm.reset();
          this.ngOnInit();
        });
      }else{
        this.closeModal(modalId);
        alertMethod('Eliminar FAQ', 'Error al eliminar la Faq', 'error');
        this.faqForm.reset();

      }
      
    } catch (error) {
      this.closeModal(modalId)
      alertMethod('Eliminar FAQ', 'Error al eliminar la Faq', 'error');
      this.faqForm.reset();
      this.faqForm.reset();
    }

  }

  openModal(modalId: string, f:Faq): void {
    this.selectedFaq = f;
    if (f) {
      this.faqForm.patchValue({
        pregunta: f.pregunta,
        respuesta: f.respuesta
      });
    }
    const modalDiv = document.getElementById(modalId);
    if (modalDiv != null) {
      modalDiv.style.display = 'block';
    }
  }

  closeModal(modalId: string) {
    const modalDiv = document.getElementById(modalId);
    if (modalDiv != null) {
      modalDiv.style.display = 'none';
    }
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop != null) {
      backdrop.parentNode?.removeChild(backdrop);
    }
  }


}
