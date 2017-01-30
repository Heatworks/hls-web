import * as React from 'react'
import { Table, Label, Button, Segment, Header } from 'semantic-ui-react'
import { Link , browserHistory} from 'react-router'

export default class UsersTable extends React.Component<{
    users: {
        data: Array<{
            name: string,
            description: string,
            email: string,
            userId: number,
            organizationId: string
        }>
        loading: boolean
        loaded: boolean
    },
    accessToken: string,
    actions: {
        load: (accessToken: string) => any
    },
    params: {
        organizationName: string
    }
},{}> {
    constructor(props) {
        super(props)
        this.props.actions.load(this.props.accessToken)
    }
    render() {
        return (
        <Table singleLine selectable >
            <Table.Header>
                <Table.Row disabled={this.props.users.loading}>
                    <Table.HeaderCell sorted={"descending"}>Name</Table.HeaderCell>
                    <Table.HeaderCell>Description</Table.HeaderCell>
                    <Table.HeaderCell>Email</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
            {this.props.users.data.map((row, index) => {
                return (<Table.Row key={index} disabled={this.props.users.loading} {...{onClick:() => {
                        browserHistory.push(`/${this.props.params.organizationName}/iam/users/${row.userId}`)
                    }}}>
                <Table.Cell>{row.name}</Table.Cell>
                <Table.Cell>{row.description}</Table.Cell>
                <Table.Cell>{row.email}</Table.Cell>
                </Table.Row>)
            })}
            </Table.Body>
        </Table>);
    }
}