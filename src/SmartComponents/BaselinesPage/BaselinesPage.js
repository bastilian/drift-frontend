import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { Main, PageHeader, PageHeaderTitle } from '@redhat-cloud-services/frontend-components';
import { Card, CardBody } from '@patternfly/react-core';
import { AddCircleOIcon, ExclamationCircleIcon, LockIcon, UndoIcon } from '@patternfly/react-icons';
import { sortable, cellWidth } from '@patternfly/react-table';

import BaselinesTable from '../BaselinesTable/BaselinesTable';
import CreateBaselineButton from './CreateBaselineButton/CreateBaselineButton';
import CreateBaselineModal from './CreateBaselineModal/CreateBaselineModal';
import EmptyStateDisplay from '../EmptyStateDisplay/EmptyStateDisplay';
import ErrorAlert from '../ErrorAlert/ErrorAlert';
import { addSystemModalActions } from '../AddSystemModal/redux';
import { baselinesTableActions } from '../BaselinesTable/redux';
import { editBaselineActions } from './EditBaselinePage/redux';
import { historicProfilesActions } from '../HistoricalProfilesPopover/redux';
import { PermissionContext } from '../../App';
import { EMPTY_BASELINES_TITLE, EMPTY_BASELINES_MESSAGE } from '../../constants';

export class BaselinesPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            columns: [
                { title: 'Name', transforms: [ sortable, cellWidth(45) ]},
                { title: 'Last updated', transforms: [ sortable, cellWidth(30) ]},
                { title: 'Associated systems', transforms: [ cellWidth(20) ]},
                { title: '', transforms: [ cellWidth(5) ]}
            ],
            errorMessage: [ 'The list of baselines cannot be displayed at this time. Please retry and if',
                'the problem persists contact your system administrator.',
                ''
            ],
            error: {}
        };
    }

    async componentDidMount() {
        await window.insights.chrome.auth.getUser();
        await window.insights?.chrome?.appAction?.('baseline-list');
    }

    componentDidUpdate(prevProps) {
        const { baselineError, notificationsSwitchError } = this.props;

        if (prevProps.baselineError !== baselineError) {
            this.setState({ error: baselineError });
        }

        if (prevProps.notificationsSwitchError !== notificationsSwitchError) {
            this.setState({ error: notificationsSwitchError });
        }
    }

    fetchBaseline = (baselineId) => {
        const { history } = this.props;

        history.push('baselines/' + baselineId);
    }

    onSelect = (event, isSelected, rowId) => {
        const { baselineTableData, selectBaseline } = this.props;
        let ids;

        if (rowId === -1) {
            ids = baselineTableData.map(function(item) {
                return item[0];
            });
        } else {
            ids = [ baselineTableData[rowId][0] ];
        }

        selectBaseline(ids, isSelected, 'CHECKBOX');
    }

    onBulkSelect = (isSelected) => {
        const { baselineTableData, selectBaseline } = this.props;
        let ids = [];

        baselineTableData.forEach(function(baseline) {
            ids.push(baseline[0]);
        });

        selectBaseline(ids, isSelected, 'CHECKBOX');
    }

    renderTable(permissions) {
        const { baselineTableData, clearEditBaselineData, emptyState, loading, notificationsSwitchError, selectedBaselineIds,
            totalBaselines } = this.props;
        const { columns } = this.state;

        clearEditBaselineData();

        return (
            <CardBody>
                <div>
                    <BaselinesTable
                        tableId='CHECKBOX'
                        hasMultiSelect={ true }
                        onSelect={ this.onSelect }
                        tableData={ baselineTableData }
                        loading={ loading }
                        columns={ columns }
                        kebab={ true }
                        createButton={ true }
                        exportButton={ true }
                        onClick={ this.fetchBaseline }
                        onBulkSelect={ this.onBulkSelect }
                        selectedBaselineIds={ selectedBaselineIds }
                        totalBaselines={ totalBaselines }
                        permissions={ permissions }
                        hasSwitch={ true }
                        notificationsSwitchError={ notificationsSwitchError }
                        emptyState={ emptyState }
                    />
                </div>
            </CardBody>
        );
    }

    renderEmptyState = (permissions) => {
        const { baselineError, emptyState, loading, revertBaselineFetch } = this.props;
        const { errorMessage } = this.state;

        if (!baselineError.status) {
            return <EmptyStateDisplay
                icon={ AddCircleOIcon }
                title={ EMPTY_BASELINES_TITLE }
                text={ EMPTY_BASELINES_MESSAGE }
                button={ <CreateBaselineButton
                    emptyState={ emptyState }
                    permissions={ permissions }
                    loading={ loading } /> }
            />;
        } else if (baselineError.status !== 200 && baselineError.status !== undefined) {
            return <EmptyStateDisplay
                icon={ ExclamationCircleIcon }
                color='#c9190b'
                title={ 'Baselines cannot be displayed' }
                text={ errorMessage }
                error={ 'Error ' + baselineError.status + ': ' + baselineError.detail }
                button={ <a onClick={ () => revertBaselineFetch('CHECKBOX') }>
                    <UndoIcon className='reload-button' />
                        Retry
                </a> }
            />;
        }
    }

    render() {
        const { error } = this.state;
        const { emptyState, loading, revertBaselineFetch, selectHistoricProfiles, setSelectedSystemIds } = this.props;

        return (
            <PermissionContext.Consumer>
                { value =>
                    <React.Fragment>
                        <CreateBaselineModal
                            permissions={ value.permissions }
                            selectHistoricProfiles={ selectHistoricProfiles }
                            setSelectedSystemIds={ setSelectedSystemIds }
                        />
                        <PageHeader>
                            <PageHeaderTitle title='Baselines'/>
                        </PageHeader>
                        <Main>
                            { value.permissions.baselinesRead === false
                                ? <EmptyStateDisplay
                                    icon={ LockIcon }
                                    color='#6a6e73'
                                    title={ 'You do not have access to Baselines' }
                                    text={ [ 'Contact your organization administrator(s) for more information.' ] }
                                />
                                : emptyState && !loading
                                    ? this.renderEmptyState(value.permissions)
                                    : <React.Fragment>
                                        <ErrorAlert
                                            error={ !emptyState && error ? error : {} }
                                            onClose={ revertBaselineFetch }
                                            tableId={ 'CHECKBOX' }
                                        />
                                        <Card className='pf-t-light pf-m-opaque-100'>
                                            {
                                                this.renderTable(value.permissions)
                                            }
                                        </Card>
                                    </React.Fragment>
                            }
                        </Main>
                    </React.Fragment>
                }
            </PermissionContext.Consumer>
        );
    }
}

BaselinesPage.propTypes = {
    loading: PropTypes.bool,
    baselineTableData: PropTypes.array,
    emptyState: PropTypes.bool,
    selectBaseline: PropTypes.func,
    history: PropTypes.object,
    baselineError: PropTypes.object,
    revertBaselineFetch: PropTypes.func,
    clearEditBaselineData: PropTypes.func,
    selectedBaselineIds: PropTypes.array,
    totalBaselines: PropTypes.number,
    selectHistoricProfiles: PropTypes.func,
    setSelectedSystemIds: PropTypes.func,
    entitiesLoading: PropTypes.func,
    notificationsSwitchError: PropTypes.object
};

function mapStateToProps(state) {
    return {
        loading: state.baselinesTableState.checkboxTable.loading,
        emptyState: state.baselinesTableState.checkboxTable.emptyState,
        baselineTableData: state.baselinesTableState.checkboxTable.baselineTableData,
        baselineError: state.baselinesTableState.checkboxTable.baselineError,
        notificationsSwitchError: state.editBaselineState.notificationsSwitchError,
        selectedBaselineIds: state.baselinesTableState.checkboxTable.selectedBaselineIds,
        totalBaselines: state.baselinesTableState.checkboxTable.totalBaselines
    };
}

function mapDispatchToProps(dispatch) {
    return {
        selectBaseline: (id, isSelected, tableId) => dispatch(baselinesTableActions.selectBaseline(id, isSelected, tableId)),
        revertBaselineFetch: (tableId) => dispatch(baselinesTableActions.revertBaselineFetch(tableId)),
        clearEditBaselineData: () => dispatch(editBaselineActions.clearEditBaselineData()),
        selectHistoricProfiles: (historicProfileIds) => dispatch(historicProfilesActions.selectHistoricProfiles(historicProfileIds)),
        setSelectedSystemIds: (selectedSystemIds) => dispatch(addSystemModalActions.setSelectedSystemIds(selectedSystemIds))
    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(BaselinesPage));
