import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Button,
    EmptyState,
    EmptyStateVariant,
    EmptyStateIcon,
    EmptyStateBody,
    InputGroup,
    TextInput,
    Title } from '@patternfly/react-core';
import { CubesIcon } from '@patternfly/react-icons';

import { baselinesTableActions } from '../../BaselinesTable/redux';

export class CreateBaseline extends Component {
    constructor(props) {
        super(props);
        this.submitBaselineName = this.submitBaselineName.bind(this);

        this.state = {
            baselineName: ''
        };

        this.updateBaselineName = value => {
            this.setState({ baselineName: value });
        };
    }

    async submitBaselineName() {
        const { baselineName } = this.state;
        const { createBaseline } = this.props;
        /*eslint-disable camelcase*/
        let newBaselineObject = { display_name: baselineName, baseline_facts: []};
        /*eslint-enable camelcase*/

        await createBaseline(newBaselineObject);
        this.props.history.push('baselines/' + this.props.baselineData.id);
    }

    render() {
        const { baselineName } = this.state;

        return (
            <React.Fragment>
                <EmptyState variant={ EmptyStateVariant.full }>
                    <EmptyStateIcon icon={ CubesIcon } />
                    <Title headingLevel="h5" size="lg">
                        Create baseline
                    </Title>
                    <EmptyStateBody>
                        Create a baseline name
                        <InputGroup>
                            <TextInput value={ baselineName } type="text" onChange={ this.updateBaselineName } aria-label="baseline name" />
                            <Button onClick={ this.submitBaselineName }>Submit</Button>
                        </InputGroup>
                    </EmptyStateBody>
                </EmptyState>
            </React.Fragment>
        );
    }
}

CreateBaseline.propTypes = {
    createBaseline: PropTypes.func,
    baselineData: PropTypes.object,
    history: PropTypes.obj
};

function mapStateToProps(state) {
    return {
        baselineData: state.baselinesTableState.baselineData
    };
}

function mapDispatchToProps(dispatch) {
    return {
        createBaseline: (newBaselineObject) => dispatch(baselinesTableActions.createBaseline(newBaselineObject))
    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(CreateBaseline));
