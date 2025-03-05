import { Component, EventEmitter, Output, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-searcher',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './searcher.component.html',
  styleUrl: './searcher.component.css'
})
export class SearcherComponent {

  @Input() data: any[] = [];

  @Input() filterAttributes: string[] = [];

  @Output() filteredData = new EventEmitter<any[]>();

  searchTerm: string = '';

  
  onSearchChange(): void {
    
    if (!this.searchTerm) {
      this.filteredData.emit(this.data);
      return; 
    }
  

    const filtered = this.data.filter(item =>
      this.filterAttributes.some(attr =>
        item[attr]?.toString().toLowerCase().includes(this.searchTerm.toLowerCase())
      )
    );

    this.filteredData.emit(filtered.length ? filtered : []);
  }
}
