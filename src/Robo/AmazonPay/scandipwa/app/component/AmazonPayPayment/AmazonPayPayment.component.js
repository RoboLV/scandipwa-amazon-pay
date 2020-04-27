/**
 * @category  Robo
 * @author    Rihards Stasans <torengo120@gmail.com>
 * @license   http://opensource.org/licenses/OSL-3.0 The Open Software License 3.0 (OSL-3.0)
 */
// eslint-disable react/sort-comp

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import TextPlaceholder from 'Component/TextPlaceholder';
import Loader from 'Component/Loader';

import './AmazonPayPayment.style';

export const STEP_ERROR = -1;
export const STEP_INITIALIZE = 0;
export const STEP_AUTHORIZE = 1;
export const STEP_DETAILS = 2;

/**
 * AmazonPayPaymentComponent
 */
export default class AmazonPayPaymentComponent extends PureComponent {
    /**
     * Prop types
     *
     * @type {{isLoading: *, widget_url: *, requestConfig: *, loadWidgetScript: *, client_id: *}}
     */
    static propTypes = {
        isLoading: PropTypes.bool,
        client_id: PropTypes.string,
        widget_url: PropTypes.string,
        merchant_id: PropTypes.string,
        error: PropTypes.bool,
        requestConfig: PropTypes.func.isRequired,
        loadWidgetScript: PropTypes.func.isRequired,
        setOrderButtonVisibility: PropTypes.func.isRequired
    };

    /**
     * Default props
     *
     * @type {{isLoading: boolean, widget_url: string, client_id: string}}
     */
    static defaultProps = {
        isLoading: false,
        error: false,
        client_id: '',
        merchant_id: '',
        widget_url: ''
    };

    /**
     * Render steps
     *
     * @type {{}}
     */
    steps = {
        [STEP_INITIALIZE]: () => null,
        [STEP_AUTHORIZE]: this.renderPaymentButton.bind(this),
        [STEP_DETAILS]: this.renderPayWithWidgets.bind(this),
        [STEP_ERROR]: this.renderAmazonPayError.bind(this)
    };

    /**
     * Constructor
     *
     * @param props
     * @param context
     */
    constructor(props, context) {
        super(props, context);

        this.state = {
            widgetRequested: false,
            paymentStep: STEP_INITIALIZE,
            access_token: '',
            errorMessage: '',
            isLoading: false,
            isInitializedDetails: false,
            orderRefId: null
        };
    }

    /**
     * On component did mount
     */
    componentDidMount() {
        const { setOrderButtonVisibility } = this.props;

        this.bindAmazonEvents();
        this.loadConfiguration();

        setOrderButtonVisibility(false);
    }

    /**
     * On component update
     */
    componentDidUpdate() {
        this.loadConfiguration();
        this.loadScriptWidget();
    }

    /**
     * On unmount
     */
    componentWillUnmount() {
        const { setOrderButtonVisibility } = this.props;

        setOrderButtonVisibility(true);
    }

    /**
     * When amazon is ready for client authorization
     */
    onAmazonLoginReady() {
        const { client_id } = this.props;

        // eslint-disable-next-line no-undef
        amazon.Login.setClientId(client_id);
        // eslint-disable-next-line no-undef
        amazon.Login.setUseCookie(true);
    }

    /**
     * On amazon is ready to process payment
     */
    onAmazonPaymentsReady() {
        this.setState({ paymentStep: STEP_AUTHORIZE });
    }

    /**
     * On amazon widget returns error
     *
     * @param error
     */
    onAmazonElementError(error) {
        switch (error.getErrorCode()) {
        case 'BuyerSessionExpired':
        case 'BuyerNotAssociated':
        case 'ITP':
            this.setState({
                errorMessage: __('Your Amazon session expired, please login again.'),
                paymentStep: STEP_AUTHORIZE,
                isLoading: false
            });
            break;
        default:
            this.setState({ isLoading: false, paymentStep: STEP_ERROR });
        }
    }

    /**
     * Provide Amazon order data
     *
     * @return {{token: string, order: string}}
     */
    async getAsyncData() {
        const { access_token, orderRefId } = this.state;

        return {
            token: access_token,
            order: orderRefId
        };
    }

    /**
     * Bind amazon Pay events
     */
    bindAmazonEvents() {
        window.onAmazonLoginReady = this.onAmazonLoginReady.bind(this);
        window.onAmazonPaymentsReady = this.onAmazonPaymentsReady.bind(this);
    }

    /**
     * Load Amazon pay script widget
     */
    loadScriptWidget() {
        const { widget_url, loadWidgetScript } = this.props;
        const { widgetRequested } = this.state;
        const newState = {};

        if (widget_url && !widgetRequested) {
            newState.widgetRequested = true;
            loadWidgetScript();

            this.setState({ widgetRequested: true });
        }
    }

    /**
     * Load component configuration if required
     */
    loadConfiguration() {
        const {
            isLoading, client_id, requestConfig, error
        } = this.props;

        if (!isLoading && !client_id) {
            if (error) {
                this.setState({ paymentStep: STEP_ERROR });

                return;
            }

            requestConfig();
        }
    }

    /**
     * Authorize amazon response
     *
     * @param response
     */
    amazonAuthorizeResponse(response) {
        if (response.error) {
            // eslint-disable-next-line no-console
            console.error(`oauth error ${response.error}`);

            this.setState({ isLoading: false, paymentStep: STEP_ERROR });
            return;
        }

        this.setState({ isLoading: false, access_token: response.access_token, paymentStep: STEP_DETAILS });
    }

    /**
     * Initialize and place button using amazon code
     */
    amazonButtonPlacement() {
        const { merchant_id } = this.props;

        // eslint-disable-next-line no-undef
        OffAmazonPayments.Button('AmazonPayButton', merchant_id, {
            type: 'PwA',
            color: 'Gold',
            size: 'large',
            language: 'en-UK',
            authorization: () => {
                this.setState({ isLoading: true });
                const loginOptions = { scope: 'profile payments:widget payments:shipping_address', popup: true };
                // eslint-disable-next-line no-undef
                amazon.Login.authorize(loginOptions, this.amazonAuthorizeResponse.bind(this));
            },
            onError: (error) => { this.onAmazonElementError(error); }
        });
    }

    /**
     * Initialize and place amazon payment detail widgets.
     */
    amazonWidgetPlacement() {
        const { merchant_id, setOrderButtonVisibility } = this.props;
        const { isInitializedDetails } = this.state;

        if (isInitializedDetails) return;
        this.setState({ isInitializedDetails: true });

        // eslint-disable-next-line no-undef
        new OffAmazonPayments.Widgets.AddressBook({
            sellerId: merchant_id,
            onOrderReferenceCreate: (orderReference) => {
                this.setState({ orderRefId: orderReference.getAmazonOrderReferenceId() });
            },
            design: {
                designMode: 'responsive'
            },
            onError: (error) => { this.onAmazonElementError(error); }
        }).bind('addressBookWidgetDiv');

        // eslint-disable-next-line no-undef
        new OffAmazonPayments.Widgets.Wallet({
            sellerId: merchant_id,
            onPaymentSelect: () => {
                setOrderButtonVisibility(true);
            },
            design: {
                designMode: 'responsive'
            },
            onError: (error) => { this.onAmazonElementError(error); }
        }).bind('walletWidgetDiv');
    }

    /**
     * Render amazon payment button
     */
    renderPaymentButton() {
        setTimeout(() => {
            const { paymentStep } = this.state;

            if (paymentStep !== STEP_AUTHORIZE) return;

            this.amazonButtonPlacement();
        }, 0);

        return <div block="AmazonPayPayment" elem="PayButton" id="AmazonPayButton" />;
    }

    /**
     * Render Billing address and payment card widgets
     */
    renderPayWithWidgets() {
        setInterval(() => {
            const { paymentStep } = this.state;

            if (paymentStep !== STEP_DETAILS) return;

            this.amazonWidgetPlacement();
        }, 0);

        return (
            <div block="AmazonPayPayment" elem="Details">
                <div block="AmazonPayPayment" elem="Address" id="addressBookWidgetDiv" />
                <div block="AmazonPayPayment" elem="Wallet" id="walletWidgetDiv" />
            </div>
        );
    }

    /**
     * Render error
     *
     * @return {null}
     */
    renderAmazonPayError() {
        return (
            <div block="AmazonPayPayment" elem="Error">
                <h2>{ __('Method is not available.') }</h2>
                <p>{ __('Please try later.') }</p>
            </div>
        );
    }

    /**
     * Is there is user error, display it
     */
    renderErrorMessage() {
        const { errorMessage } = this.state;

        if (errorMessage) {
            return (
                <p block="AmazonPayPayment" elem="ErrorMessage">{ errorMessage }</p>
            );
        }

        return null;
    }

    /**
     * Render payment step
     */
    renderStep() {
        const { paymentStep } = this.state;

        return this.steps[paymentStep]();
    }

    /**
     * Render
     */
    render() {
        const { isLoading } = this.props;
        const { isLoading: stateLoading } = this.state;
        const showLoader = isLoading || stateLoading;

        return (
            <div block="AmazonPayPayment" elem="Wrapper">
                <Loader isLoading={ showLoader } />
                { showLoader ? <TextPlaceholder length="block" /> : null }
                { this.renderErrorMessage() }
                { this.renderStep() }
            </div>
        );
    }
}
