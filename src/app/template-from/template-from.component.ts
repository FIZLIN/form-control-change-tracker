import { Component, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { hasChanges, ChangeTrackerDirective } from 'form-control-change-tracker';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-template-from',
  templateUrl: './template-from.component.html',
  styleUrls: ['./template-from.component.scss']
})
export class TemplateFromComponent {

  unpopulated = true;

  unpopulatedDummyData = {
    firstName: '',
    lastName: '',
    gender: null
  };

  populatedDummyData = {
    firstName: 'Test 1',
    lastName: 'Test 2',
  };

  lastNameInitialValues = ['', '123'];

  @ViewChildren(ChangeTrackerDirective) @hasChanges() hasFormChanges: boolean;
  @ViewChildren(ChangeTrackerDirective) changeTrackers: QueryList<ChangeTrackerDirective>;
  @ViewChild(NgForm) form: NgForm;

  constructor() { }

  resetInitialValues() { this.changeTrackers.forEach(i => i.resetInitialValue()); }

  addToInitialValues(value) {
    if (this.lastNameInitialValues.includes(value)) { return; }
    this.lastNameInitialValues = this.lastNameInitialValues.concat(value);
    this.resetInitialValues();
  }

  reset() {
    if (this.unpopulated) {
      this.unpopulatedDummyData = this.form.value;
      this.addToInitialValues(this.unpopulatedDummyData.lastName);
    } else {
      this.populatedDummyData = this.form.value;
    }
    this.resetInitialValues();
  }

  submit() {
    alert('Form was submitted!');
  }
}
