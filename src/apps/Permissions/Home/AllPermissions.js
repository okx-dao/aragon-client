import React, { useCallback, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import {
  DropDown,
  GU,
  IconSearch,
  TextInput,
  textStyle,
  useLayout,
  useTheme,
} from '@aragon/ui'
import debounce from 'lodash.debounce'
import EmptyBlock from '../EmptyBlock'
import EmptyFilteredPermission from '../EmptyFilteredPermissions'
import PermissionsView from '../PermissionsView'

const ENTITY_TYPES = ['All entities', 'Accounts', 'Apps']

function AllPermissions({ loading, permissions, onManageRole }) {
  const [selectedEntityType, setSelectedEntityType] = useState(-1)
  const [searchTerms, setSearchTerms] = useState('')
  const { layoutName } = useLayout()

  const filteredPermissions = useMemo(() => {
    return (
      permissions

        // Filter by search terms
        .filter(permission => {
          const preparedSearchTerms = searchTerms.trim().toLowerCase()
          if (preparedSearchTerms === '') {
            return true
          }
          const appName = permission.app.name.toLowerCase()
          const roleName = permission.role.name.toLowerCase()
          const roleId = permission.role.id.toLowerCase()
          return (
            appName.includes(preparedSearchTerms) ||
            roleName.includes(preparedSearchTerms) ||
            roleId.includes(preparedSearchTerms)
          )
        })

        // Filter by account types
        .filter(permission => {
          // accounts
          if (selectedEntityType === 1) {
            return permission.entities.some(entity => entity.type !== 'app')
          }

          // apps
          if (selectedEntityType === 2) {
            return permission.entities.some(entity => entity.type === 'app')
          }

          return true
        })
    )
  }, [searchTerms, permissions, selectedEntityType])

  if (loading) {
    return <EmptyBlock>Loading permissions…</EmptyBlock>
  }

  if (permissions.length === 0) {
    return <EmptyBlock>No permissions have been assigned yet.</EmptyBlock>
  }

  return (
    <PermissionsView
      permissions={filteredPermissions}
      onManageRole={onManageRole}
      heading={
        layoutName === 'large' && (
          <Heading
            emptyFilter={Boolean(
              !filteredPermissions.length && permissions.length
            )}
            selectedEntityType={selectedEntityType}
            onEntityTypeChange={setSelectedEntityType}
            searchTerms={searchTerms}
            onSearchTermsChange={setSearchTerms}
          />
        )
      }
      showApps
    />
  )
}

AllPermissions.propTypes = {
  loading: PropTypes.bool.isRequired,
  onManageRole: PropTypes.func.isRequired,
  permissions: PropTypes.array.isRequired,
}

function Heading({
  emptyFilter,
  selectedEntityType,
  onEntityTypeChange,
  searchTerms,
  onSearchTermsChange,
}) {
  const theme = useTheme()
  const [searchTermsInputValue, setSearchTermsInputValue] = useState(
    searchTerms
  )

  const debouncedSearchTermsUpdate = useCallback(
    debounce(value => onSearchTermsChange(value), 300),
    [onSearchTermsChange]
  )

  const handleEntityDropDownChange = useCallback(
    index => {
      onEntityTypeChange(index || -1)
    },
    [onEntityTypeChange]
  )

  const handleSearchInputChange = useCallback(
    event => {
      // immediately update the text field
      setSearchTermsInputValue(event.target.value)
      // but debounce the external update
      debouncedSearchTermsUpdate(event.target.value)
    },
    [debouncedSearchTermsUpdate]
  )

  const handleOnClear = useCallback(() => {
    onEntityTypeChange(-1)
    onSearchTermsChange('')
    setSearchTermsInputValue('')
  }, [onEntityTypeChange, onSearchTermsChange])

  return (
    <React.Fragment>
      <div
        css={`
          display: flex;
          width: 100%;
          justify-content: space-between;
          align-items: center;
        `}
      >
        <div
          css={`
            white-space: nowrap;
            ${textStyle('body2')}
            font-weight: 600;
          `}
        >
          All assigned permissions
        </div>
        <div>
          <label
            css={`
              margin-right: ${2 * GU}px;
              color: ${theme.surfaceContentSecondary};
            `}
          >
            <DropDown
              placeholder="Entity type"
              items={ENTITY_TYPES}
              selected={selectedEntityType}
              onChange={handleEntityDropDownChange}
              css={`
                min-width: ${16 * GU}px;
              `}
            />
          </label>
          <TextInput
            css={`
              width: ${38 * GU}px;
            `}
            adornment={
              <IconSearch
                css={`
                  color: ${theme.surfaceIcon};
                `}
              />
            }
            adornmentPosition="end"
            onChange={handleSearchInputChange}
            placeholder="Search by app or role"
            value={searchTermsInputValue}
          />
        </div>
      </div>
      {emptyFilter && <EmptyFilteredPermission onClear={handleOnClear} />}
    </React.Fragment>
  )
}

Heading.propTypes = {
  emptyFilter: PropTypes.bool,
  selectedEntityType: PropTypes.number.isRequired,
  onEntityTypeChange: PropTypes.func.isRequired,
  searchTerms: PropTypes.string.isRequired,
  onSearchTermsChange: PropTypes.func.isRequired,
}

export default AllPermissions
