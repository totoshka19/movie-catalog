import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss'
})
export class SearchBarComponent implements OnInit, OnDestroy {
  @Input() initialQuery: string = ''; // 1. Добавляем Input для получения начального значения
  @Output() searchChange = new EventEmitter<string>();

  // Получаем доступ к нативному элементу input из шаблона
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  searchControl = new FormControl('');
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    // 2. Устанавливаем начальное значение в FormControl при инициализации
    // { emitEvent: false } предотвращает срабатывание valueChanges и отправку события наверх
    this.searchControl.setValue(this.initialQuery, { emitEvent: false });

    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(value => {
        this.searchChange.emit(value ?? '');
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Очищает поле ввода и устанавливает на него фокус.
   */
  clearSearch(): void {
    this.searchControl.setValue('');
    // Возвращаем фокус в поле ввода для удобства пользователя
    this.searchInput.nativeElement.focus();
  }
}
