
import React from 'react';
import { Col, Form } from 'react-bootstrap';
import { FieldProps } from 'react-jsonschema-form';


export type UnitFieldFormData<Unit> = { value?: any, unit: Unit };
export type UnitFieldState<Unit> = { value?: any, unit: Unit };
export type UnitFieldProps<Unit> = FieldProps<UnitFieldFormData<Unit>>;

export abstract class UnitField<Unit extends string>
    extends React.Component<UnitFieldProps<Unit>, UnitFieldState<Unit>>
{
    constructor(props: UnitFieldProps<Unit>) {
        super(props);
        const initialState: UnitFieldState<Unit> = {
            value: '',
            ...this.getInitialState(),
        };

        this.state = initialState;
        this.updateFormData();
    }

    private updateFormData = () => {
        const formData = this.prepareFormData();
        this.props.onChange(formData);
    }

    getInitialState(): UnitFieldState<Unit> {
        const initialState: UnitFieldState<Unit> = {} as any;
        const { formData } = this.props;

        if (formData) {
            if (formData.value != null) {
                initialState.value = formData.value.toString();
            }
            if (formData.unit != null) {
                initialState.unit = formData.unit;
            }
        }
        return initialState;
    }
    abstract getUnitValues(): Unit[];

    setFormState(stateDiff: Partial<UnitFieldState<Unit>>) {
        this.setState(
            (prevState) => ({ ...prevState, ...stateDiff, }),
            this.updateFormData,
        );
    }

    protected abstract getInputs(): JSX.Element;
    protected prepareFormData(): any {
        const parsedValue = parseFloat(this.state.value || '');
        const formData = (
            !isNaN(parsedValue) ?
                { value: parsedValue, unit: this.state.unit } :
                null
        );
        return formData;
    }


    render() {
        const { unit } = this.state;

        return (
            <>
                <Form.Label htmlFor={`${this.props.name}_value`}>
                    {this.props.schema.title}
                </Form.Label>
                <Form.Row>
                    {
                        this.getInputs()
                    }
                    <Col>
                        <Form.Control
                            as="select"
                            value={unit}
                            onChange={(event: any) => this.setFormState({ unit: event.target.value })}
                        >
                            {
                                this.getUnitValues().map(unit => (
                                    <option key={unit} value={unit}>
                                        {unit}
                                    </option>
                                ))
                            }
                        </Form.Control>
                    </Col>
                </Form.Row>
            </>
        );
    }
}
