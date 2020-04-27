/**
 * @category  Robo
 * @author    Rihards Stasans <torengo120@gmail.com>
 * @license   http://opensource.org/licenses/OSL-3.0 The Open Software License 3.0 (OSL-3.0)
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import { AmazonPayQuery } from 'Query';
import { executeGet } from 'Util/Request';
import { prepareQuery } from 'Util/Query';
import { ONE_MONTH_IN_SECONDS } from 'Util/Request/QueryDispatcher';

import AmazonPayPayment from './AmazonPayPayment.component';

/**
 * AmazonPayPaymentContainer
 */
export class AmazonPayPaymentContainer extends PureComponent {
    /**
     * Props
     *
     * @type {{setAuthorizeNetRef: *}}
     */
    static propTypes = {
        setAmazonPayRef: PropTypes.func.isRequired
    };

    /**
     * Container methods that should be available on component
     *
     * @type {{}}
     */
    containerMethods = {
        requestConfig: this.requestConfig.bind(this),
        loadWidgetScript: this.loadWidgetScript.bind(this)
    };

    /**
     * React ref to component
     *
     * @type {React.RefObject<unknown>}
     */
    ref = React.createRef();

    /**
     * Constructor
     *
     * @param props
     * @param context
     */
    constructor(props, context) {
        super(props, context);

        this.state = {
            isLoading: false,
            widget_url: '',
            client_id: '',
            merchant_id: '',
            error: false
        };
    }

    /**
     * On mount
     */
    componentDidMount() {
        const { setAmazonPayRef } = this.props;

        setAmazonPayRef(this.ref);
    }

    /**
     * Load Amazon pay configuration
     *
     * @return {Promise<Request>}
     */
    requestConfig() {
        this.setState({ isLoading: true });

        const promise = executeGet(
            prepareQuery([AmazonPayQuery.getConfigQuery()]),
            'AmazonPayConfigContainer',
            ONE_MONTH_IN_SECONDS
        );

        promise.then(
            ({ storeConfig: { amazonPay } }) => this.setState({
                isLoading: false,
                ...amazonPay,
                error: amazonPay.merchant_id === '' || amazonPay.client_id === '' || amazonPay.widget_url === ''
            }),
            () => this.setState({ isLoading: false, error: true })
        );

        return promise;
    }

    /**
     * Load Amazon Pay widget
     */
    loadWidgetScript() {
        const { widget_url } = this.state;

        const script = document.createElement('script');
        script.src = widget_url;
        script.async = 'async';
        document.head.insertBefore(script, document.head.childNodes[0]);
    }

    /**
     * Render
     */
    render() {
        return (
            <AmazonPayPayment
              ref={ this.ref }
              { ...this.props }
              { ...this.state }
              { ...this.containerMethods }
            />
        );
    }
}

export default AmazonPayPaymentContainer;
