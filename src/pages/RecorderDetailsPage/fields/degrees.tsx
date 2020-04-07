import React from 'react';
import { UnitField, UnitFieldState } from './unitFieldBase';
import { Form, Col } from 'react-bootstrap';

export enum DegreesUnit {
    Celsius = 'Celsius',
    Fahrenheit = 'Fahrenheit',
}

export class DegreesField extends UnitField<DegreesUnit> {
    protected getInputs(): JSX.Element {
        const { value } = this.state;
        return (
            <Col>
                <Form.Control
                    id={`${this.props.name}_value`}
                    inputMode="decimal"
                    type="number"
                    step={0.001}
                    value={value}
                    onChange={(event: any) => this.setFormState({ value: event.target.value })}
                />
            </Col>
        );
    }

    getInitialState(): UnitFieldState<DegreesUnit> {
        return {
            unit: DegreesUnit.Fahrenheit,
            ...super.getInitialState(),
        };
    }

    getUnitValues(): DegreesUnit[] {
        return [DegreesUnit.Fahrenheit, DegreesUnit.Celsius];
    }
}
