import * as React from 'react'

import { Icon } from 'semantic-ui-react'

export function iconForStatus(status) {
    switch(status) {
        case 'passing':
        case 'running':
            return <Icon name='spinner' loading />
        case 'passed':
            return <Icon name='check circle outline' color="green" />
        case 'failing':
            return <Icon name='spinner' loading color="red" />
        case 'failed':
            return <Icon name='remove circle' color="red" />
        default:
            return <Icon name='radio' color="grey" />
    }
}
