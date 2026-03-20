import {
  Component,
  inject,
  computed,
  signal,
  ElementRef,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';
import { ExpenseHistoryService } from '../../core/services/expense-history.service';
import { AppConfigService } from '../../core/services/app-config.service';

const CHART_SCHEME: Color = {
  name: 'app',
  selectable: true,
  group: ScaleType.Ordinal,
  domain: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'],
};

const CHART_HEIGHT = 240;
/** Tailwind sm breakpoint in px — below this, always single-column */
const SM_BREAKPOINT = 640;
/** Gap between grid columns in px (gap-5 = 20px) */
const GRID_GAP = 20;

@Component({
  selector: 'app-expense-history',
  standalone: true,
  imports: [NgxChartsModule],
  templateUrl: './expense-history.component.html',
})
export class ExpenseHistoryComponent implements AfterViewInit, OnDestroy {
  private readonly historyService = inject(ExpenseHistoryService);
  private readonly configService = inject(AppConfigService);
  private readonly el = inject(ElementRef<HTMLElement>);

  private resizeObserver!: ResizeObserver;
  /** Full inner width of the content column (tracked via sizer div) */
  private readonly _containerWidth = signal(600);

  readonly chartScheme = CHART_SCHEME;

  readonly layout = computed(() => this.configService.config().history.layout);
  readonly isEnabled = computed(() => this.configService.config().history.enabled);
  readonly currentSnapshot = this.historyService.currentMonthSnapshot;
  readonly historicalMonths = this.historyService.historicalMonths;

  /**
   * Chart width adapts to layout + container size.
   * Grid mode: 2 columns on ≥sm screens, 1 column (full width) on mobile.
   * List mode: always full width.
   */
  readonly chartView = computed<[number, number]>(() => {
    const total = this._containerWidth();
    const isGrid = this.layout() === 'grid' && total >= SM_BREAKPOINT;
    const w = isGrid ? Math.floor((total - GRID_GAP) / 2) : total;
    return [Math.max(w, 180), CHART_HEIGHT];
  });

  /** CSS classes for the months wrapper — grid or list */
  readonly wrapperClass = computed(() =>
    this.layout() === 'grid'
      ? 'grid grid-cols-1 sm:grid-cols-2 gap-5'
      : 'flex flex-col gap-6'
  );

  ngAfterViewInit(): void {
    const sizer: HTMLElement | null = (this.el.nativeElement as HTMLElement).querySelector(
      '[data-chart-sizer]'
    );
    const target = sizer ?? (this.el.nativeElement as HTMLElement);

    this.resizeObserver = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? target.clientWidth;
      this._containerWidth.set(Math.max(Math.floor(width), 180));
    });

    this.resizeObserver.observe(target);
    this._containerWidth.set(Math.max(target.clientWidth, 180));
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }
}
