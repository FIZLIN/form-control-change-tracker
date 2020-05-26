import { QueryList } from '@angular/core';
import { ChangeTrackerDirective } from './change-tracker.directive';
import { combineLatest, Subject, asyncScheduler } from 'rxjs';
import { takeUntil, observeOn } from 'rxjs/operators';

const _items = Symbol('items');
const _configureWatch = Symbol('configureWatch');
const _hasChanges = Symbol('hasChanges');
const _isAlive = Symbol('isAlive');

function getDefaultValueForConfig(config?: { includeChangedValues: boolean }) {
  return config && config.includeChangedValues ? { hasChanges: false, values: {} } : false;
}

export function hasChanges(config?: { includeChangedValues: boolean }) {
  return function (target: any, propertyKey: string) {
    Object.defineProperty(target, propertyKey, {
      set(items: QueryList<ChangeTrackerDirective>) {
        this[_isAlive] = new Subject();
        this[_items] = items;
        this[_configureWatch] = function () {
          const currentItems = this[_items] as QueryList<ChangeTrackerDirective>;
          combineLatest(currentItems.map(i => ((i as any)._change as Subject<any>))).pipe(
            takeUntil(this[_isAlive]), observeOn(asyncScheduler)
          ).subscribe(newValue => {
            if (config && config.includeChangedValues) {
              this[_hasChanges].hasChanges = newValue.includes(true);
              this[_hasChanges].values = currentItems.reduce((acc, curr) => {
                acc[(curr as any).ngControl.name] = { initial: curr.initialValue, current: curr.currentValue };
                return acc;
              }, this[_hasChanges].values);
              return;
            }
            this[_hasChanges] = newValue.includes(true);
          });
        };
        this[_configureWatch]();
        items.changes.pipe(takeUntil(this[_isAlive])).subscribe((newItems: QueryList<ChangeTrackerDirective>) => {
          this[_items] = newItems;
          this[_configureWatch]();
        });
      },
      get() {
        if (this[_hasChanges] === undefined) { this[_hasChanges] = getDefaultValueForConfig(config); }
        return this[_hasChanges];
      }
    });

    const _originalNgOnDestroy = target.ngOnDestroy;

    const _ngOnDestroy: any = function () {
      if (_originalNgOnDestroy) {
        _originalNgOnDestroy.call(this);
      }
      (this[_isAlive] as Subject<void>).next();
      (this[_isAlive] as Subject<void>).complete();
    };

    Object.defineProperty(target, 'ngOnDestroy', {
      get() {
        return _ngOnDestroy;
      }
    });
  };
}
