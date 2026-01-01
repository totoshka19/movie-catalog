import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tmdbImage',
  standalone: true,
})
export class TmdbImagePipe implements PipeTransform {
  transform(path: string | null | undefined, size: string = 'w500'): string | null {
    if (!path) {
      return null;
    }
    return path;
  }
}
