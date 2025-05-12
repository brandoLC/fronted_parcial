// Updated ports to match the Docker configuration
export const environment = {
  production: false,

  // Endpoints locales de desarrollo
  nestApiBase: 'http://Load-proyecto-1073641052.us-east-1.elb.amazonaws.com:3000',
  goApiBase:   'http://Load-proyecto-1073641052.us-east-1.elb.amazonaws.com:8070', // Restaurado al puerto original
  fiberApiBase:'http://Load-proyecto-1073641052.us-east-1.elb.amazonaws.com:9001',
  orchApiBase: 'http://Load-proyecto-1073641052.us-east-1.elb.amazonaws.com:9000' // Restaurado para apuntar al puerto correcto
};
