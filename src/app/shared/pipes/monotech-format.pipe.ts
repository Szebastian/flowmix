import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'monotechFormat',
  standalone: true,
})
export class MonotechFormatPipe implements PipeTransform {
  transform(value: unknown): string {
    if (value === null || value === undefined) {
      return '';
    }
    return String(value)
      .toUpperCase()
      .replace(/\s+/g, '_');
  }
}
