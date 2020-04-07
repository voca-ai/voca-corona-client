import React from 'react';
import { UnitField, UnitFieldState } from './unitFieldBase';
import { Form, Col } from 'react-bootstrap';


export enum HeightUnit {
    Feet = 'Feet',
    Centimeters = 'Centimeters',
}

export class HeightField extends UnitField<HeightUnit> {
    protected getInputs(): JSX.Element {
        const { value, unit } = this.state;
        return (
            unit === HeightUnit.Feet ?
                <>
                    <Col>
                        <Form.Control
                            id={`${this.props.name}_value_feet`}
                            inputMode="decimal"
                            placeholder="Feet"
                            title="Feet"
                            type="number"
                            step={1}
                            value={value.feet || ''}
                            onChange={(event: any) => this.setFormState({ value: { feet: event.target.value, inches: value.inches } })}
                        />
                    </Col>
                    <Col>
                        <Form.Control
                            id={`${this.props.name}_value_inches`}
                            inputMode="decimal"
                            placeholder="Inches"
                            title="Inches"
                            type="number"
                            step={1}
                            value={value.inches || ''}
                            onChange={(event: any) => this.setFormState({ value: { feet: value.feet, inches: event.target.value } })}
                        />
                    </Col>
                </> :
                <Col>
                    <Form.Control
                        id={`${this.props.name}_value`}
                        inputMode="decimal"
                        type="number"
                        step={0.001}
                        value={value || ''}
                        onChange={(event: any) => this.setFormState({ value: event.target.value })}
                    />
                </Col>
        );
    }

    protected prepareFormData() {
        if (this.state.unit === HeightUnit.Feet) {
            const { feet: feetStr = '', inches: inchesStr = '' } = this.state.value || {};

            const feet = parseFloat(feetStr);
            const inches = parseFloat(inchesStr);
            const formData = (
                !isNaN(feet) || !isNaN(inches) ?
                    {
                        value: {
                            feet: feet || 0,
                            inches: inches || 0,
                        },
                        unit: this.state.unit,
                    } :
                    null
            );
            return formData;
        } else {
            return super.prepareFormData();
        }
    }

    getInitialState() {
        const initialState: UnitFieldState<HeightUnit> = {} as any;
        const { formData } = this.props;

        initialState.unit = HeightUnit.Feet;

        if (formData) {
            if (formData.value != null) {
                if (formData.unit === HeightUnit.Centimeters) {
                    initialState.value = formData.value.toString();
                } else {
                    initialState.value = {
                        feet: formData.value.feet.toString(),
                        inches: formData.value.inches.toString(),
                    };
                }
            }
            if (formData.unit != null) {
                initialState.unit = formData.unit;
            }
        }
        return initialState;
    }

    getUnitValues(): HeightUnit[] {
        return [HeightUnit.Feet, HeightUnit.Centimeters];
    }
}
