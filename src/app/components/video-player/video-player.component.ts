import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  inject,
  Input,
  Output,
  signal,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-video-player',
  standalone: true,
  imports: [],
  templateUrl: './video-player.component.html',
  styleUrl: './video-player.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoPlayerComponent implements AfterViewInit {
  /**
   * Ключ YouTube видео, обязательный параметр.
   */
  @Input({ required: true }) videoKey!: string;
  /**
   * Заголовок видео, опционально.
   */
  @Input() title: string = 'Трейлер';

  /**
   * Событие, которое вызывается при закрытии плеера.
   */
  @Output() close = new EventEmitter<void>();

  private readonly sanitizer = inject(DomSanitizer);

  /**
   * Сигнал для управления CSS-классом, который запускает анимации появления/исчезновения.
   */
  protected readonly isVisible = signal(false);

  /**
   * Безопасный URL для встраивания в iframe.
   */
  get videoUrl(): SafeResourceUrl {
    const url = `https://www.youtube.com/embed/${this.videoKey}?autoplay=1&rel=0`;
    // Используем DomSanitizer для предотвращения XSS-атак
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  /**
   * После того, как компонент отрисовался в DOM,
   * запускаем анимацию появления с небольшой задержкой.
   */
  ngAfterViewInit(): void {
    setTimeout(() => this.isVisible.set(true), 10);
  }

  /**
   * Прослушивает нажатие клавиши Escape на уровне документа
   * и вызывает метод закрытия.
   */
  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.onClose();
  }

  // Предотвращаем закрытие при клике на сам плеер
  onContentClick(event: MouseEvent): void {
    event.stopPropagation();
  }

  onClose(): void {
    this.isVisible.set(false);
    setTimeout(() => this.close.emit(), 300); // Синхронизируем с анимацией
  }
}
