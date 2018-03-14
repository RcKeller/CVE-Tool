import React from 'react'
import Helmet from 'react-helmet'

class NotFound extends React.Component {
  render () {
    return (
      <article>
        <Helmet title='404 - Not Found' />
        <section>
          <p>The requested page does not exist. If you believe this is an error, e-mail the webmaster.</p>
        </section>
      </article>
    )
  }
}

export default NotFound
