import {
  Directive,
  TemplateRef,
  ViewContainerRef,
  Input,
  Renderer2,
  ChangeDetectorRef
} from '@angular/core';
import { timer } from 'rxjs';

@Directive({
  selector: '[ngtIfAnimate]'
})
export class IfAnimateDirective {
  @Input() ngtIfAnimateDelay: number;

  @Input() set ngtIfAnimate(display: boolean) {
    if (display) {
      this.containerRef.clear();

      if (this.ngtIfAnimateDelay) {
        timer(this.ngtIfAnimateDelay).subscribe(() => {
          this.containerRef.createEmbeddedView(this.templateRef);

          this.triggerAnimation(this.templateValue, this.enterAnimationClass);

          this.cdRef.markForCheck();
        });
      } else {
        this.containerRef.createEmbeddedView(this.templateRef);

        this.triggerAnimation(this.templateValue, this.enterAnimationClass);
      }
    } else {
      if (this.templateValue) {
        this.triggerAnimation(this.templateValue, this.exitAnimationClass).then(() => {
          this.containerRef.clear();
        });
      }
    }
  }

  private get templateValue(): HTMLElement {
    return this.templateRef.elementRef.nativeElement.nextElementSibling;
  }

  private get enterAnimationClass() {
    if (this.templateValue) {
      return this.templateValue.getAttribute('enter') || 'entering';
    }

    return 'entering';
  }

  private get exitAnimationClass() {
    if (this.templateValue) {
      return this.templateValue.getAttribute('exit') || 'exiting';
    }

    return 'exiting';
  }

  constructor(
    private templateRef: TemplateRef<any>,
    private containerRef: ViewContainerRef,
    private renderer: Renderer2,
    private cdRef: ChangeDetectorRef
  ) {}

  private triggerAnimation(el: HTMLElement, animation: string): Promise<void> {
    return new Promise(resolve => {
      const listener = this.renderer.listen(el, 'animationend', () => {
        this.renderer.removeClass(el, animation);

        listener();

        resolve();
      });

      this.renderer.addClass(el, animation);
    });
  }
}