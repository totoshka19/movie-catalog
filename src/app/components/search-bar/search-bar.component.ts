import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, effect, input } from '@angular/core';
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
export class SearchBarComponent {
  // 1. Заменяем @Input() на сигнал-инпут input()
  initialQuery = input<string>('');
  placeholder = input<string>('Поиск...');

  @Output() searchChange = new EventEmitter<string>();
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  searchControl = new FormControl('');

  constructor() {
    // 2. Создаем effect, который будет реагировать на изменение initialQuery
    effect(() => {
      // Получаем текущее значение из сигнала-инпута
      const query = this.initialQuery();

      // Устанавливаем значение в FormControl, но не вызываем событие valueChanges,
      // чтобы избежать бесконечного цикла (URL -> input -> control -> output -> URL).
      this.searchControl.setValue(query, { emitEvent: false });
    });

    // Эта часть остается без изменений: она отвечает за отправку данных,
    // когда ПОЛЬЗОВАТЕЛЬ вводит текст.
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed()
      )
      .subscribe(value => {
        this.searchChange.emit(value ?? '');
      });
  }

  // 3. ngOnInit больше не нужен, так как его логику взял на себя effect.

  clearSearch(): void {
    this.searchControl.setValue('');
    this.searchInput.nativeElement.focus();
  }
}
