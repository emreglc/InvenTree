import { Trans, t } from '@lingui/macro';
import { Alert, Badge, Text } from '@mantine/core';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AddItemButton } from '../../components/buttons/AddItemButton';
import { ApiFormFieldSet } from '../../components/forms/fields/ApiFormField';
import { ApiEndpoints } from '../../enums/ApiEndpoints';
import { ModelType } from '../../enums/ModelType';
import { UserRoles } from '../../enums/Roles';
import { getDetailUrl } from '../../functions/urls';
import {
  useCreateApiFormModal,
  useDeleteApiFormModal,
  useEditApiFormModal
} from '../../hooks/UseForm';
import { useTable } from '../../hooks/UseTable';
import { apiUrl } from '../../states/ApiState';
import { useUserState } from '../../states/UserState';
import { TableColumn } from '../Column';
import { BooleanColumn, DescriptionColumn } from '../ColumnRenderers';
import { TableFilter } from '../Filter';
import { InvenTreeTable } from '../InvenTreeTable';
import { RowDeleteAction, RowEditAction } from '../RowActions';

export default function PartTestTemplateTable({ partId }: { partId: number }) {
  const table = useTable('part-test-template');
  const user = useUserState();
  const navigate = useNavigate();

  const tableColumns: TableColumn[] = useMemo(() => {
    return [
      {
        accessor: 'test_name',
        switchable: false,
        sortable: true,
        render: (record: any) => {
          return (
            <Text
              weight={record.required && 700}
              color={record.enabled ? undefined : 'red'}
            >
              {record.test_name}
            </Text>
          );
        }
      },
      {
        accessor: 'results',
        switchable: true,
        sortable: true,
        title: t`Results`,
        render: (record: any) => {
          return record.results || <Badge color="blue">{t`No Results`}</Badge>;
        }
      },
      DescriptionColumn({
        switchable: false
      }),
      BooleanColumn({
        accessor: 'enabled'
      }),
      BooleanColumn({
        accessor: 'required'
      }),
      BooleanColumn({
        accessor: 'requires_value'
      }),
      BooleanColumn({
        accessor: 'requires_attachment'
      })
    ];
  }, [partId]);

  const tableFilters: TableFilter[] = useMemo(() => {
    return [
      {
        name: 'required',
        description: t`Show required tests`
      },
      {
        name: 'enabled',
        description: t`Show enabled tests`
      },
      {
        name: 'requires_value',
        description: t`Show tests that require a value`
      },
      {
        name: 'requires_attachment',
        description: t`Show tests that require an attachment`
      },
      {
        name: 'include_inherited',
        label: t`Include Inherited`,
        description: t`Show tests from inherited templates`
      },
      {
        name: 'has_results',
        label: t`Has Results`,
        description: t`Show tests which have recorded results`
      }
    ];
  }, []);

  const partTestTemplateFields: ApiFormFieldSet = useMemo(() => {
    return {
      part: {
        hidden: !user.isStaff()
      },
      test_name: {},
      description: {},
      required: {},
      requires_value: {},
      requires_attachment: {},
      enabled: {}
    };
  }, [user]);

  const newTestTemplate = useCreateApiFormModal({
    url: ApiEndpoints.part_test_template_list,
    title: t`Add Test Template`,
    fields: partTestTemplateFields,
    initialData: {
      part: partId
    },
    onFormSuccess: table.refreshTable
  });

  const [selectedTest, setSelectedTest] = useState<number>(-1);

  const editTestTemplate = useEditApiFormModal({
    url: ApiEndpoints.part_test_template_list,
    pk: selectedTest,
    title: t`Edit Test Template`,
    fields: partTestTemplateFields,
    onFormSuccess: (record: any) => table.updateRecord(record)
  });

  const deleteTestTemplate = useDeleteApiFormModal({
    url: ApiEndpoints.part_test_template_list,
    pk: selectedTest,
    title: t`Delete Test Template`,
    preFormContent: (
      <Alert color="red" title={t`This action cannot be reversed`}>
        <Text>
          <Trans>
            Any tests results associated with this template will be deleted
          </Trans>
        </Text>
      </Alert>
    ),
    onFormSuccess: table.refreshTable
  });

  const rowActions = useCallback(
    (record: any) => {
      const can_edit = user.hasChangeRole(UserRoles.part);
      const can_delete = user.hasDeleteRole(UserRoles.part);

      if (record.part != partId) {
        // No actions, as this test is defined for a parent part
        return [];
      }

      return [
        RowEditAction({
          hidden: !can_edit,
          onClick: () => {
            setSelectedTest(record.pk);
            editTestTemplate.open();
          }
        }),
        RowDeleteAction({
          hidden: !can_delete,
          onClick: () => {
            setSelectedTest(record.pk);
            deleteTestTemplate.open();
          }
        })
      ];
    },
    [user, partId]
  );

  const tableActions = useMemo(() => {
    let can_add = user.hasAddRole(UserRoles.part);

    return [
      <AddItemButton
        tooltip={t`Add Test Template`}
        onClick={() => newTestTemplate.open()}
        disabled={!can_add}
      />
    ];
  }, [user]);

  return (
    <>
      {newTestTemplate.modal}
      {editTestTemplate.modal}
      {deleteTestTemplate.modal}
      <InvenTreeTable
        url={apiUrl(ApiEndpoints.part_test_template_list)}
        tableState={table}
        columns={tableColumns}
        props={{
          params: {
            part: partId,
            part_detail: true
          },
          tableFilters: tableFilters,
          tableActions: tableActions,
          rowActions: rowActions,
          onRowClick: (row) => {
            if (row.part && row.part != partId) {
              // This test is defined for a different part
              navigate(getDetailUrl(ModelType.part, row.part));
            }
          }
        }}
      />
    </>
  );
}
