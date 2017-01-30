import * as React from 'react'
import { Table, Label, Button, Segment, Header, Modal, Icon} from 'semantic-ui-react'
import { Link , browserHistory} from 'react-router'

export default class AccessTokensTable extends React.Component<{
    accessTokens: {
        data: Array<{
            accessToken: string,
            description: string,
            userId: number,
            organizationName: string,
            organizationId: string,
            policy: any
        }>
        loading: boolean
        loaded: boolean
    },
    accessToken: string,
    actions: {
        load: (accessToken: string) => any,
        deleteAccessToken: (accessTokenToDelete:string, accessTokenAuthorization:string) => any
    },
    params: {
        organizationName: string,
        iamId?: string
    }
},{}> {
    constructor(props) {
        super(props)
        this.props.actions.load(this.props.accessToken)
    }
    render() {
        var currentToken = null;
        if (this.props.params.iamId !== undefined && this.props.params.iamId !== undefined) {
            var currentTokens = this.props.accessTokens.data.filter((accessTokenData) => {
                return (accessTokenData.accessToken == this.props.params.iamId);
            })
            if (currentTokens.length == 1) {
                currentToken = currentTokens[0];
            }
        }
        return (
        <Table singleLine selectable >
            <Table.Header>
                <Table.Row disabled={this.props.accessTokens.loading}>
                    <Table.HeaderCell sorted={"descending"}>Access Token</Table.HeaderCell>
                    <Table.HeaderCell>User ID</Table.HeaderCell>
                    <Table.HeaderCell>Policy</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
            {this.props.accessTokens.data.map((row, index) => {
                return (<Table.Row key={index} disabled={this.props.accessTokens.loading} {...{onClick:() => {
                        browserHistory.push(`/${this.props.params.organizationName}/iam/accessTokens/${row.accessToken}`)
                    }}}>
                <Table.Cell>{row.accessToken}</Table.Cell>
                <Table.Cell>{row.userId}</Table.Cell>
                <Table.Cell>{JSON.stringify(row.policy)}</Table.Cell>
                </Table.Row>)
            })}
            {(currentToken !== null) ? 
            <Modal open={(currentToken !== null)} onClose={() => {
                browserHistory.push(`/${this.props.params.organizationName}/iam/accessTokens`)
            }} closeIcon='close'>
                <Modal.Header><small>Access Token:</small> <Label>{this.props.params.iamId}</Label></Modal.Header>
                <Modal.Content>
                    <Modal.Description>
                        <Header>Policy</Header>
                        <p><code>{JSON.stringify(currentToken.policy)}</code></p>
                        <Label>User: {currentToken.userId}</Label> <Label>OrganizationName: {currentToken.organizationName}</Label>
                    </Modal.Description>
                </Modal.Content>
                <Modal.Actions>
                    <Button color='red' onClick={() => {
                        this.props.actions.deleteAccessToken(this.props.params.iamId, this.props.accessToken)
                    }}>
                        <Icon name='remove' /> Revoke
                    </Button>
                </Modal.Actions>
            </Modal> : null }
            </Table.Body>
        </Table>
        );
    }
}