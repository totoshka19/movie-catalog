import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss',
})
export class SearchBarComponent implements OnInit {
  @Input() initialQuery: string = '';
  @Input() placeholder: string = 'Поиск...';
  @Output() searchChange = new EventEmitter<string>();

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  searchControl = new FormControl('');

  constructor() {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        // takeUntilDestroyed должен вызываться в конструкторе,
        // чтобы получить доступ к контексту инъекции и жизненному циклу компонента.
        takeUntilDestroyed()
      )
      .subscribe(value => {
        this.searchChange.emit(value ?? '');
      });
  }

  ngOnInit(): void {
    // Установка начального значения происходит здесь,
    // так как @Input-свойства гарантированно доступны только в ngOnInit.
    this.searchControl.setValue(this.initialQuery, { emitEvent: false });
  }

  clearSearch(): void {
    this.searchControl.setValue('');
    this.searchInput.nativeElement.focus();
  }
}
