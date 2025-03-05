import { Component, OnInit } from '@angular/core';
import { Faq } from '../../../core/models/faq.interface';
import { CommonModule } from '@angular/common';
import { FaqService } from '../../../core/services/faq.service';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.css'
})
export class FaqComponent implements OnInit{
  faqs: Faq[] = []
  searchText: string = '';
  selectedFaqId: number | null = null;

  constructor(private faqService: FaqService) {}

  ngOnInit(): void {
    this.faqService.findAllFaqs().subscribe((faqs: Faq[]) => {
      this.faqs = faqs;
    });
  }

  toggleFaq(faqId: number): void {
    this.selectedFaqId = this.selectedFaqId === faqId ? null : faqId;
  }


}
