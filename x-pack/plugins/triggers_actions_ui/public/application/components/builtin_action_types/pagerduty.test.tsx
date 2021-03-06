/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import React, { FunctionComponent } from 'react';
import { mountWithIntl } from 'test_utils/enzyme_helpers';
import { TypeRegistry } from '../../type_registry';
import { registerBuiltInActionTypes } from './index';
import { ActionTypeModel, ActionParamsProps } from '../../../types';
import {
  PagerDutyActionParams,
  EventActionOptions,
  SeverityActionOptions,
  PagerDutyActionConnector,
} from './types';

const ACTION_TYPE_ID = '.pagerduty';
let actionTypeModel: ActionTypeModel;

beforeAll(() => {
  const actionTypeRegistry = new TypeRegistry<ActionTypeModel>();
  registerBuiltInActionTypes({ actionTypeRegistry });
  const getResult = actionTypeRegistry.get(ACTION_TYPE_ID);
  if (getResult !== null) {
    actionTypeModel = getResult;
  }
});

describe('actionTypeRegistry.get() works', () => {
  test('action type static data is as expected', () => {
    expect(actionTypeModel.id).toEqual(ACTION_TYPE_ID);
    expect(actionTypeModel.iconClass).toEqual('test-file-stub');
  });
});

describe('pagerduty connector validation', () => {
  test('connector validation succeeds when connector config is valid', () => {
    const actionConnector = {
      secrets: {
        routingKey: 'test',
      },
      id: 'test',
      actionTypeId: '.pagerduty',
      name: 'pagerduty',
      config: {
        apiUrl: 'http:\\test',
      },
    } as PagerDutyActionConnector;

    expect(actionTypeModel.validateConnector(actionConnector)).toEqual({
      errors: {
        routingKey: [],
      },
    });

    delete actionConnector.config.apiUrl;
    actionConnector.secrets.routingKey = 'test1';
    expect(actionTypeModel.validateConnector(actionConnector)).toEqual({
      errors: {
        routingKey: [],
      },
    });
  });

  test('connector validation fails when connector config is not valid', () => {
    const actionConnector = {
      secrets: {},
      id: 'test',
      actionTypeId: '.pagerduty',
      name: 'pagerduty',
      config: {
        apiUrl: 'http:\\test',
      },
    } as PagerDutyActionConnector;

    expect(actionTypeModel.validateConnector(actionConnector)).toEqual({
      errors: {
        routingKey: ['A routing key is required.'],
      },
    });
  });
});

describe('pagerduty action params validation', () => {
  test('action params validation succeeds when action params is valid', () => {
    const actionParams = {
      eventAction: 'trigger',
      dedupKey: 'test',
      summary: '2323',
      source: 'source',
      severity: 'critical',
      timestamp: new Date().toISOString(),
      component: 'test',
      group: 'group',
      class: 'test class',
    };

    expect(actionTypeModel.validateParams(actionParams)).toEqual({
      errors: {
        summary: [],
        timestamp: [],
      },
    });
  });
});

describe('PagerDutyActionConnectorFields renders', () => {
  test('all connector fields is rendered', () => {
    expect(actionTypeModel.actionConnectorFields).not.toBeNull();
    if (!actionTypeModel.actionConnectorFields) {
      return;
    }
    const ConnectorFields = actionTypeModel.actionConnectorFields;
    const actionConnector = {
      secrets: {
        routingKey: 'test',
      },
      id: 'test',
      actionTypeId: '.pagerduty',
      name: 'pagerduty',
      config: {
        apiUrl: 'http:\\test',
      },
    } as PagerDutyActionConnector;
    const wrapper = mountWithIntl(
      <ConnectorFields
        action={actionConnector}
        errors={{ routingKey: [] }}
        editActionConfig={() => {}}
        editActionSecrets={() => {}}
      />
    );
    expect(wrapper.find('[data-test-subj="pagerdutyApiUrlInput"]').length > 0).toBeTruthy();
    expect(
      wrapper
        .find('[data-test-subj="pagerdutyApiUrlInput"]')
        .first()
        .prop('value')
    ).toBe('http:\\test');
    expect(wrapper.find('[data-test-subj="pagerdutyRoutingKeyInput"]').length > 0).toBeTruthy();
  });
});

describe('PagerDutyParamsFields renders', () => {
  test('all params fields is rendered', () => {
    expect(actionTypeModel.actionParamsFields).not.toBeNull();
    if (!actionTypeModel.actionParamsFields) {
      return;
    }
    const ParamsFields = actionTypeModel.actionParamsFields as FunctionComponent<
      ActionParamsProps<PagerDutyActionParams>
    >;
    const actionParams = {
      eventAction: EventActionOptions.TRIGGER,
      dedupKey: 'test',
      summary: '2323',
      source: 'source',
      severity: SeverityActionOptions.CRITICAL,
      timestamp: new Date().toISOString(),
      component: 'test',
      group: 'group',
      class: 'test class',
    };
    const wrapper = mountWithIntl(
      <ParamsFields
        actionParams={actionParams}
        errors={{ summary: [], timestamp: [] }}
        editAction={() => {}}
        index={0}
      />
    );
    expect(wrapper.find('[data-test-subj="severitySelect"]').length > 0).toBeTruthy();
    expect(
      wrapper
        .find('[data-test-subj="severitySelect"]')
        .first()
        .prop('value')
    ).toStrictEqual('critical');
    expect(wrapper.find('[data-test-subj="eventActionSelect"]').length > 0).toBeTruthy();
    expect(wrapper.find('[data-test-subj="dedupKeyInput"]').length > 0).toBeTruthy();
    expect(wrapper.find('[data-test-subj="timestampInput"]').length > 0).toBeTruthy();
    expect(wrapper.find('[data-test-subj="componentInput"]').length > 0).toBeTruthy();
    expect(wrapper.find('[data-test-subj="groupInput"]').length > 0).toBeTruthy();
    expect(wrapper.find('[data-test-subj="sourceInput"]').length > 0).toBeTruthy();
    expect(wrapper.find('[data-test-subj="pagerdutySummaryInput"]').length > 0).toBeTruthy();
    expect(wrapper.find('[data-test-subj="dedupKeyAddVariableButton"]').length > 0).toBeTruthy();
  });
});
