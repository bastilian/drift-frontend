import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import { Main, PageHeader, PageHeaderTitle } from '@redhat-cloud-services/frontend-components';
import { Card, CardBody, Toolbar, ToolbarGroup, ToolbarItem, PaginationVariant } from '@patternfly/react-core';
import { ExclamationCircleIcon, LockIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { baselinesTableActions } from '../BaselinesTable/redux';
import { addSystemModalActions } from '../AddSystemModal/redux';
import { compareActions } from '../modules';
import { historicProfilesActions } from '../HistoricalProfilesPopover/redux';
import { setHistory } from '../../Utilities/SetHistory';

import DriftTable from './DriftTable/DriftTable';
import ErrorAlert from '../ErrorAlert/ErrorAlert';
import TablePagination from '../Pagination/Pagination';
import AddSystemButton from './AddSystemButton/AddSystemButton';
import DriftToolbar from './DriftToolbar/DriftToolbar';
import EmptyStateDisplay from '../EmptyStateDisplay/EmptyStateDisplay';
import { PermissionContext } from '../../App';

import { EMPTY_COMPARISON_TITLE, EMPTY_COMPARISON_MESSAGE } from '../../constants';

export class DriftPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isFirstReference: true
        };
    }

    async componentDidMount() {
        await window.insights.chrome.auth.getUser();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.location.search !== '' && this.props.location.search === '') {
            this.setHistory();
        }
    }

    setHistory = () => {
        const { activeFactFilters, baselines, factFilter, factSort, factTypeFilters, historicalProfiles, history, referenceId, stateFilters,
            stateSort, systems } = this.props;

        let systemIds = systems.map(system => system.id);
        let baselineIds = baselines.map(baseline => baseline.id);
        let HSPIds = historicalProfiles.map(hsp => hsp.id);

        setHistory(
            history, systemIds, baselineIds, HSPIds, referenceId, activeFactFilters, factFilter, factTypeFilters, stateFilters, factSort, stateSort
        );
    }

    setIsFirstReference = (value) => {
        this.setState({
            isFirstReference: value
        });
    }

    onClose = () => {
        const { revertCompareData, history, previousStateSystems } = this.props;

        revertCompareData();
        setHistory(history, previousStateSystems.map(system => system.id));
    }

    renderEmptyState = () => {
        const { error } = this.props;

        if (error.status) {
            return <EmptyStateDisplay
                icon={ ExclamationCircleIcon }
                color='#c9190b'
                title={ 'Comparison cannot be displayed' }
                text={ EMPTY_COMPARISON_MESSAGE }
                error={ 'Error ' + error.status + ': ' + error.detail }
                button={ <AddSystemButton/> }
            />;
        } else {
            return <EmptyStateDisplay
                icon={ PlusCircleIcon }
                color='#6a6e73'
                title={ EMPTY_COMPARISON_TITLE }
                text={ EMPTY_COMPARISON_MESSAGE }
                button={ <AddSystemButton/> }
            />;
        }
    }

    render() {
        const { activeFactFilters, addStateFilter, baselines, clearAllFactFilters, clearAllSelections, clearComparison, clearComparisonFilters,
            clearSelectedBaselines, emptyState, error, exportToCSV, exportToJSON, factFilter, factSort, factTypeFilters, filterByFact,
            handleFactFilter, historicalProfiles, handleBaselineSelection, handleHSPSelection, handleSystemSelection, history, loading, page, perPage,
            referenceId, resetComparisonFilters, selectedBaselineIds, selectedHSPIds, stateFilters, stateSort, systems, toggleFactTypeFilter,
            totalFacts, updatePagination, updateReferenceId } = this.props;
        const { isFirstReference } = this.state;

        return (
            <React.Fragment>
                <PageHeader>
                    <PageHeaderTitle title='Comparison'/>
                </PageHeader>
                <Main>
                    <PermissionContext.Consumer>
                        { value =>
                            value.permissions.compareRead === false
                                ? <EmptyStateDisplay
                                    icon={ LockIcon }
                                    color='#6a6e73'
                                    title={ 'You do not have access to Drift comparison' }
                                    text={ [ 'Contact your organization administrator(s) for more information.' ] }
                                />
                                : <React.Fragment>
                                    <ErrorAlert
                                        error={ error }
                                        onClose={ this.onClose }
                                    />
                                    { emptyState && !loading
                                        ? this.renderEmptyState()
                                        : <div></div>
                                    }
                                    <Card className='pf-t-light pf-m-opaque-100'>
                                        <CardBody>
                                            { !emptyState
                                                ? <DriftToolbar
                                                    loading={ loading }
                                                    history={ history }
                                                    page={ page }
                                                    perPage={ perPage }
                                                    totalFacts={ totalFacts }
                                                    updatePagination={ updatePagination }
                                                    clearComparison={ clearComparison }
                                                    clearComparisonFilters={ clearComparisonFilters }
                                                    exportToCSV={ exportToCSV }
                                                    exportToJSON={ exportToJSON }
                                                    updateReferenceId={ updateReferenceId }
                                                    setIsFirstReference={ this.setIsFirstReference }
                                                    clearSelectedBaselines={ clearSelectedBaselines }
                                                    factFilter={ factFilter }
                                                    factTypeFilters={ factTypeFilters }
                                                    filterByFact={ filterByFact }
                                                    stateFilters={ stateFilters }
                                                    addStateFilter={ addStateFilter }
                                                    toggleFactTypeFilter={ toggleFactTypeFilter }
                                                    activeFactFilters={ activeFactFilters }
                                                    handleFactFilter={ handleFactFilter }
                                                    clearAllFactFilters={ clearAllFactFilters }
                                                    setHistory={ this.setHistory }
                                                    resetComparisonFilters={ resetComparisonFilters }
                                                    clearAllSelections={ clearAllSelections }
                                                />
                                                : null
                                            }
                                            <DriftTable
                                                updateReferenceId={ updateReferenceId }
                                                error={ error }
                                                isFirstReference={ isFirstReference }
                                                setIsFirstReference={ this.setIsFirstReference }
                                                clearComparison= { clearComparison }
                                                handleBaselineSelection={ handleBaselineSelection }
                                                handleHSPSelection={ handleHSPSelection }
                                                handleSystemSelection={ handleSystemSelection }
                                                permissions={ value.permissions }
                                                handleFactFilter={ handleFactFilter }
                                                addStateFilter={ addStateFilter }
                                                stateFilters={ stateFilters }
                                                activeFactFilters={ activeFactFilters }
                                                factFilter={ factFilter }
                                                setHistory={ this.setHistory }
                                                factSort={ factSort }
                                                stateSort={ stateSort }
                                                referenceId={ referenceId }
                                                systems={ systems }
                                                baselines={ baselines }
                                                historicalProfiles={ historicalProfiles }
                                                selectedHSPIds={ selectedHSPIds }
                                                selectedBaselineIds={ selectedBaselineIds }
                                                factTypeFilters={ factTypeFilters }
                                                toggleFactTypeFilter={ toggleFactTypeFilter }
                                            />
                                            { !emptyState && !loading ?
                                                <Toolbar className="drift-toolbar">
                                                    <ToolbarGroup className="pf-c-pagination">
                                                        <ToolbarItem>
                                                            <TablePagination
                                                                page={ page }
                                                                perPage={ perPage }
                                                                total={ totalFacts }
                                                                isCompact={ false }
                                                                updatePagination={ updatePagination }
                                                                widgetId='drift-pagination-bottom'
                                                                ouiaId='drift-pagination-bottom'
                                                                variant={ PaginationVariant.bottom }
                                                            />
                                                        </ToolbarItem>
                                                    </ToolbarGroup>
                                                </Toolbar>
                                                : null
                                            }
                                        </CardBody>
                                    </Card>
                                </React.Fragment>
                        }
                    </PermissionContext.Consumer>
                </Main>
            </React.Fragment>
        );
    }
}

DriftPage.propTypes = {
    perPage: PropTypes.number,
    page: PropTypes.number,
    totalFacts: PropTypes.number,
    error: PropTypes.object,
    loading: PropTypes.bool,
    clearSelectedBaselines: PropTypes.func,
    emptyState: PropTypes.bool,
    updatePagination: PropTypes.func,
    updateReferenceId: PropTypes.func,
    clearComparison: PropTypes.func,
    clearComparisonFilters: PropTypes.func,
    history: PropTypes.object,
    location: PropTypes.object,
    selectHistoricProfiles: PropTypes.func,
    selectedHSPIds: PropTypes.array,
    revertCompareData: PropTypes.func,
    previousStateSystems: PropTypes.array,
    exportToCSV: PropTypes.func,
    exportToJSON: PropTypes.func,
    factFilter: PropTypes.string,
    factTypeFilters: PropTypes.array,
    activeFactFilters: PropTypes.array,
    handleFactFilter: PropTypes.func,
    filterByFact: PropTypes.func,
    stateFilters: PropTypes.array,
    addStateFilter: PropTypes.func,
    toggleFactTypeFilter: PropTypes.func,
    clearAllFactFilters: PropTypes.func,
    factSort: PropTypes.string,
    stateSort: PropTypes.string,
    referenceId: PropTypes.number,
    systems: PropTypes.array,
    baselines: PropTypes.array,
    historicalProfiles: PropTypes.array,
    loadEntities: PropTypes.func,
    selectedBaselineIds: PropTypes.array,
    handleBaselineSelection: PropTypes.func,
    handleHSPSelection: PropTypes.func,
    handleSystemSelection: PropTypes.func,
    resetComparisonFilters: PropTypes.func,
    clearAllSelections: PropTypes.func
};

function mapDispatchToProps(dispatch) {
    return {
        clearSelectedBaselines: (tableId) => dispatch(baselinesTableActions.clearSelectedBaselines(tableId)),
        updatePagination: (pagination) => dispatch(compareActions.updatePagination(pagination)),
        updateReferenceId: (id) => dispatch(compareActions.updateReferenceId(id)),
        clearComparison: () => dispatch(compareActions.clearComparison()),
        clearComparisonFilters: () => dispatch(compareActions.clearComparisonFilters()),
        selectHistoricProfiles: (historicProfileIds) => dispatch(historicProfilesActions.selectHistoricProfiles(historicProfileIds)),
        revertCompareData: () => dispatch(compareActions.revertCompareData()),
        exportToCSV: () => dispatch(compareActions.exportToCSV()),
        exportToJSON: () => dispatch(compareActions.exportToJSON()),
        filterByFact: (filter) => dispatch(compareActions.filterByFact(filter)),
        addStateFilter: (filter) => dispatch(compareActions.addStateFilter(filter)),
        toggleFactTypeFilter: (filter) => dispatch(compareActions.toggleFactTypeFilter(filter)),
        handleFactFilter: (filter) => dispatch(compareActions.handleFactFilter(filter)),
        clearAllFactFilters: () => dispatch(compareActions.clearAllFactFilters()),
        loadEntities: () => dispatch({ type: 'LOAD_ENTITIES' }),
        handleSystemSelection: (content, isSelected) => dispatch(addSystemModalActions.handleSystemSelection(content, isSelected)),
        handleBaselineSelection: (content, isSelected) => dispatch(addSystemModalActions.handleBaselineSelection(content, isSelected)),
        handleHSPSelection: (content) => dispatch(addSystemModalActions.handleHSPSelection(content)),
        resetComparisonFilters: () => dispatch(compareActions.resetComparisonFilters()),
        clearAllSelections: () => dispatch(addSystemModalActions.clearAllSelections())
    };
}

function mapStateToProps(state) {
    return {
        page: state.compareState.page,
        perPage: state.compareState.perPage,
        totalFacts: state.compareState.totalFacts,
        error: state.compareState.error,
        loading: state.compareState.loading,
        emptyState: state.compareState.emptyState,
        selectedHSPIds: state.historicProfilesState.selectedHSPIds,
        previousStateSystems: state.compareState.previousStateSystems,
        factFilter: state.compareState.factFilter,
        factTypeFilters: state.compareState.factTypeFilters,
        stateFilters: state.compareState.stateFilters,
        activeFactFilters: state.compareState.activeFactFilters,
        factSort: state.compareState.factSort,
        stateSort: state.compareState.stateSort,
        referenceId: state.compareState.referenceId,
        systems: state.compareState.systems,
        baselines: state.compareState.baselines,
        historicalProfiles: state.compareState.historicalProfiles,
        selectedBaselineIds: state.baselinesTableState.comparisonTable.selectedBaselineIds
    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(DriftPage));
